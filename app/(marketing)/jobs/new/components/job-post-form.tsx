"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Container,
  Input,
  Label,
  PageHeader,
  Textarea,
  Typography,
  useToast,
} from "@/components/ui";
import { CategoryCombobox } from "@/components/services/category-combobox";
import { SeekerLocationField } from "@/components/location/seeker-location-field";
import { usePrototype } from "@/components/prototype/prototype-provider";
import { DEFAULT_MAP_CENTER } from "@/lib/maps/maps-config";
import {
  fromDateTimeLocalValue,
  toDateTimeLocalValue,
} from "@/lib/prototype-bookings";
import type { BookingLocation } from "@/lib/prototype-types";
import {
  useCreateJobMutation,
  useGetServiceCategoriesQuery,
} from "@/service/api";
import {
  getApiErrorMessage,
  getStoredAuthUser,
} from "@/service/auth-session";
import { getAccessToken } from "@/service/splitApiSetting";

function isValidPhone(value: string) {
  return /^[+()\d\s-]{8,}$/.test(value.trim());
}

const emptyLocation = (): BookingLocation => ({
  address: "",
  lat: DEFAULT_MAP_CENTER.lat,
  lng: DEFAULT_MAP_CENTER.lng,
});

function defaultRequestedLocal() {
  const date = new Date();
  date.setHours(date.getHours() + 24, 0, 0, 0);
  return toDateTimeLocalValue(date.toISOString());
}

export function JobPostForm() {
  const router = useRouter();
  const { pushToast } = useToast();
  const { ready, currentSeeker, identifySeeker } = usePrototype();
  const [createJob, { isLoading: busy }] = useCreateJobMutation();
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useGetServiceCategoriesQuery();

  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState(currentSeeker?.name ?? "");
  const [phone, setPhone] = useState(currentSeeker?.phone ?? "");
  const [location, setLocation] = useState<BookingLocation>(emptyLocation);
  const [requestedLocal, setRequestedLocal] = useState(defaultRequestedLocal);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  const authUser = getStoredAuthUser();
  const hasToken = Boolean(getAccessToken());
  /** Real seeker account — name/phone come from the users table via JWT. */
  const useAccountApi = authUser?.role === "SEEKER" && hasToken;

  useEffect(() => {
    if (useAccountApi || !currentSeeker) return;
    setName((prev) => prev || currentSeeker.name);
    setPhone((prev) => prev || currentSeeker.phone);
  }, [currentSeeker, useAccountApi]);

  if (!ready) {
    return (
      <Container className="py-[var(--space-8)]">
        <Typography variant="body">Loading...</Typography>
      </Container>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    const guestName =
      name.trim() || currentSeeker?.name?.trim() || authUser?.name?.trim() || "";
    const guestPhone =
      phone.trim() ||
      currentSeeker?.phone?.trim() ||
      authUser?.phone?.trim() ||
      "";

    if (!categoryId) nextErrors.categoryId = "Select a service category.";
    if (!title.trim()) nextErrors.title = "Enter a job title.";
    if (!description.trim()) nextErrors.description = "Describe what you need.";
    if (!useAccountApi) {
      if (!guestName) nextErrors.name = "Enter your name.";
      if (!isValidPhone(guestPhone)) {
        nextErrors.phone = "Enter a valid phone number.";
      }
    }
    if (!location.address.trim()) {
      nextErrors.location = "Enter where the work is needed.";
    }
    const requestedAt = fromDateTimeLocalValue(requestedLocal);
    if (!requestedAt) {
      nextErrors.requestedAt = "Choose when you need this done.";
    } else if (new Date(requestedAt).getTime() < Date.now() - 60_000) {
      nextErrors.requestedAt = "Pick a time in the future.";
    }
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length > 0) return;

    try {
      const result = await createJob({
        categoryId,
        title: title.trim(),
        description: description.trim(),
        address: location.address.trim(),
        lat: location.lat,
        lng: location.lng,
        requestedAt,
        ...(useAccountApi ? {} : { guestName, guestPhone }),
      }).unwrap();

      if (!useAccountApi) {
        identifySeeker({ name: guestName, phone: guestPhone });
      }

      pushToast({
        tone: "success",
        title: "Job posted",
        description: `Posted under ${result.categoryName}. Matching providers can bid now.`,
      });
      router.replace("/seeker/dashboard?tab=jobs");
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Could not post this job. Try again.",
      );
      setFormError(message);
      pushToast({
        tone: "error",
        title: "Post failed",
        description: message,
      });
    }
  };

  return (
    <Container className="py-[var(--space-6)] lg:py-[var(--space-8)]">
      <div className="mb-[var(--space-6)]">
        <PageHeader
          tone="primary"
          eyebrow="Job board"
          title="Post a job"
          description="Pick a service category first, then describe the work. Only providers with active services in that category will see your post."
        />
      </div>

      <form
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
        className="mx-auto max-w-xl space-y-[var(--space-4)] rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-5)]"
        noValidate
      >
        {useAccountApi ? (
          <Typography variant="caption" className="block text-muted">
            Signed in as {authUser?.name}. Your contact details come from your
            account.
          </Typography>
        ) : (
          <Typography variant="caption" className="block text-muted">
            Create an account to track this job after you switch devices.{" "}
            <Link
              href="/seeker/signup"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
            {" · "}
            <Link
              href="/seeker/login"
              className="font-medium text-primary hover:underline"
            >
              Log in
            </Link>
          </Typography>
        )}

        <div data-field="categoryId">
          <Label htmlFor="job-category">Service category</Label>
          <CategoryCombobox
            id="job-category"
            value={categoryId}
            categories={categories}
            loading={categoriesLoading}
            invalid={Boolean(errors.categoryId)}
            onChange={(value) => {
              setCategoryId(value);
              setErrors((prev) => {
                const next = { ...prev };
                delete next.categoryId;
                return next;
              });
            }}
          />
          {errors.categoryId ? (
            <Typography variant="caption" className="mt-2 block text-error">
              {errors.categoryId}
            </Typography>
          ) : null}
          {categoriesError ? (
            <Typography variant="caption" className="mt-2 block text-error">
              Could not load categories. Refresh and try again.
            </Typography>
          ) : null}
        </div>

        <div>
          <Label htmlFor="job-title">Title</Label>
          <Input
            id="job-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Apartment deep clean before move-in"
          />
          {errors.title ? (
            <Typography variant="caption" className="mt-2 block text-error">
              {errors.title}
            </Typography>
          ) : null}
        </div>

        <div>
          <Label htmlFor="job-description">Description</Label>
          <Textarea
            id="job-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What needs doing, timing flexibility, any details that help providers bid."
          />
          {errors.description ? (
            <Typography variant="caption" className="mt-2 block text-error">
              {errors.description}
            </Typography>
          ) : null}
        </div>

        {!useAccountApi ? (
          <>
            <div>
              <Label htmlFor="job-seeker-name">Your name</Label>
              <Input
                id="job-seeker-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Jordan Lee"
              />
              {errors.name ? (
                <Typography variant="caption" className="mt-2 block text-error">
                  {errors.name}
                </Typography>
              ) : null}
            </div>

            <div>
              <Label htmlFor="job-seeker-phone">Phone number</Label>
              <Input
                id="job-seeker-phone"
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+1 (555) 000-0000"
              />
              {errors.phone ? (
                <Typography variant="caption" className="mt-2 block text-error">
                  {errors.phone}
                </Typography>
              ) : null}
            </div>
          </>
        ) : null}

        <SeekerLocationField
          value={location}
          onChange={setLocation}
          error={errors.location}
        />

        <div>
          <Label htmlFor="job-requested-at">When do you need this?</Label>
          <Input
            id="job-requested-at"
            type="datetime-local"
            value={requestedLocal}
            onChange={(event) => setRequestedLocal(event.target.value)}
          />
          {errors.requestedAt ? (
            <Typography variant="caption" className="mt-2 block text-error">
              {errors.requestedAt}
            </Typography>
          ) : null}
        </div>

        {formError ? (
          <Typography variant="caption" className="block text-error">
            {formError}
          </Typography>
        ) : null}

        <div className="flex flex-wrap gap-[var(--space-3)]">
          <Button
            type="submit"
            disabled={busy || categoriesLoading || categoriesError}
          >
            {busy ? "Posting..." : "Post job"}
          </Button>
          <Button as="a" href="/seeker/dashboard" variant="secondary">
            Cancel
          </Button>
        </div>
      </form>
    </Container>
  );
}
