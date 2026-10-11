"use client";

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
import { SeekerLocationField } from "@/components/location/seeker-location-field";
import { usePrototype } from "@/components/prototype/prototype-provider";
import { DEFAULT_MAP_CENTER } from "@/lib/maps/maps-config";
import type { BookingLocation } from "@/lib/prototype-types";

function isValidPhone(value: string) {
  return /^[+()\d\s-]{8,}$/.test(value.trim());
}

const emptyLocation = (): BookingLocation => ({
  address: "",
  lat: DEFAULT_MAP_CENTER.lat,
  lng: DEFAULT_MAP_CENTER.lng,
});

export function JobPostForm() {
  const router = useRouter();
  const { pushToast } = useToast();
  const { ready, currentSeeker, createJobPost } = usePrototype();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState(currentSeeker?.name ?? "");
  const [phone, setPhone] = useState(currentSeeker?.phone ?? "");
  const [location, setLocation] = useState<BookingLocation>(emptyLocation);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!currentSeeker) return;
    setName((prev) => prev || currentSeeker.name);
    setPhone((prev) => prev || currentSeeker.phone);
  }, [currentSeeker]);

  if (!ready) {
    return (
      <Container className="py-[var(--space-8)]">
        <Typography variant="body">Loading...</Typography>
      </Container>
    );
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!title.trim()) nextErrors.title = "Enter a job title.";
    if (!description.trim()) nextErrors.description = "Describe what you need.";
    if (!name.trim()) nextErrors.name = "Enter your name.";
    if (!isValidPhone(phone)) nextErrors.phone = "Enter a valid phone number.";
    if (!location.address.trim()) {
      nextErrors.location = "Enter where the work is needed.";
    }
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length > 0) return;

    setBusy(true);
    const result = createJobPost({
      title,
      description,
      seekerName: name,
      seekerPhone: phone,
      location: {
        address: location.address.trim(),
        lat: location.lat,
        lng: location.lng,
      },
    });
    setBusy(false);

    if (!result.ok) {
      setFormError(result.reason);
      return;
    }

    pushToast({
      tone: "success",
      title: "Job posted",
      description: "Providers can bid now. Track your post and accept offers here.",
    });
    router.replace("/requests?tab=jobs");
  };

  return (
    <Container className="py-[var(--space-6)] lg:py-[var(--space-8)]">
      <div className="mb-[var(--space-6)]">
        <PageHeader
          tone="primary"
          eyebrow="Job board"
          title="Post a job"
          description="Describe the work and location. Verified providers will bid a price — you accept one."
        />
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-xl space-y-[var(--space-4)] rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-5)]"
        noValidate
      >
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

        <SeekerLocationField
          value={location}
          onChange={setLocation}
          error={errors.location}
        />

        {formError ? (
          <Typography variant="caption" className="block text-error">
            {formError}
          </Typography>
        ) : null}

        <div className="flex flex-wrap gap-[var(--space-3)]">
          <Button type="submit" disabled={busy}>
            {busy ? "Posting..." : "Post job"}
          </Button>
          <Button as="a" href="/requests" variant="secondary">
            Cancel
          </Button>
        </div>
      </form>
    </Container>
  );
}
