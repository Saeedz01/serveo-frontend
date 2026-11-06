"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePrototype } from "@/components/prototype/prototype-provider";
import {
  Button,
  EmptyState,
  PageHeader,
  ProviderListSkeleton,
  Typography,
  useToast,
} from "@/components/ui";
import { defaultAvailability } from "@/lib/prototype-availability";
import type { PriceUnit } from "@/lib/prototype-types";
import { isOtherServicesCategory } from "@/lib/suggest-category";
import {
  useCreateServiceMutation,
  useGetServiceCategoriesQuery,
  useGetServiceCitiesQuery,
} from "@/service/api";
import { getApiErrorMessage } from "@/service/auth-session";
import { ServiceFormFields } from "./service-form-fields";

const FIELD_ORDER = [
  "title",
  "cityId",
  "categoryId",
  "description",
  "specialty",
  "imageUrl",
  "priceAmount",
  "address",
  "radiusKm",
] as const;

export function CreateServiceForm() {
  const router = useRouter();
  const { pushToast } = useToast();
  const { ready, currentProvider } = usePrototype();
  const [createService, { isLoading }] = useCreateServiceMutation();
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useGetServiceCategoriesQuery();
  const {
    data: cities = [],
    isLoading: citiesLoading,
    isError: citiesError,
  } = useGetServiceCitiesQuery();
  const formRef = useRef<HTMLFormElement>(null);
  const [title, setTitle] = useState("");
  const [cityId, setCityId] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [address, setAddress] = useState("");
  const [priceAmount, setPriceAmount] = useState(49);
  const [priceUnit, setPriceUnit] = useState<PriceUnit>("project");
  const [radiusKm, setRadiusKm] = useState(10);
  const [lat, setLat] = useState(31.5204);
  const [lng, setLng] = useState(74.3587);
  const [availability, setAvailability] = useState(defaultAvailability);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const verified = currentProvider?.status === "verified";

  if (!ready) {
    return (
      <div className="space-y-[var(--space-6)]">
        <PageHeader
          tone="primary"
          eyebrow="New offering"
          title="Create a service"
          description="Add details seekers need — including category, price, and map coverage."
        />
        <ProviderListSkeleton rows={3} />
      </div>
    );
  }

  if (!currentProvider) {
    return (
      <EmptyState
        title="Provider session required"
        description="Sign up first, then create draft services while verification is in progress."
        action={
          <Button as="a" href="/provider/signup">
            Become a provider
          </Button>
        }
      />
    );
  }

  if (currentProvider.status === "rejected") {
    return (
      <EmptyState
        title="Account rejected"
        description="Your identity was not approved, so you can’t create new services right now."
        action={
          <Button as="a" href="/provider/dashboard" variant="secondary">
            Back to dashboard
          </Button>
        }
      />
    );
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!title.trim()) nextErrors.title = "Title is required.";
    if (!cityId) nextErrors.cityId = "City is required.";
    if (!categoryId) nextErrors.categoryId = "Subcategory is required.";
    if (!description.trim()) nextErrors.description = "Description is required.";
    if (
      isOtherServicesCategory(categories, categoryId) &&
      !specialty.trim()
    ) {
      nextErrors.specialty = "Describe your specialty for Other Services.";
    }
    if (!imageUrl) nextErrors.imageUrl = "Service image is required.";
    if (!address.trim()) nextErrors.address = "Address is required.";
    if (!Number.isFinite(priceAmount) || priceAmount <= 0) {
      nextErrors.priceAmount = "Enter a price greater than 0.";
    }
    if (!Number.isFinite(radiusKm) || radiusKm < 1) {
      nextErrors.radiusKm = "Radius must be at least 1 km.";
    }
    return nextErrors;
  };

  const scrollToFirstError = (nextErrors: Record<string, string>) => {
    const firstKey = FIELD_ORDER.find((key) => nextErrors[key]);
    if (!firstKey || !formRef.current) return;
    const target = formRef.current.querySelector(`[data-field="${firstKey}"]`);
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const submit = async (status: "draft" | "published") => {
    if (status === "published" && !verified) {
      pushToast({
        tone: "error",
        title: "Publishing is locked",
        description:
          "An admin must verify your identity before you can publish. You can still save a draft.",
      });
      return;
    }

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      scrollToFirstError(nextErrors);
      pushToast({
        tone: "error",
        title: "Missing required fields",
        description: "Please fix the highlighted fields and try again.",
      });
      return;
    }

    try {
      await createService({
        categoryId,
        cityId,
        title,
        description,
        specialty: specialty.trim() || undefined,
        imageUrl,
        address,
        lat,
        lng,
        radiusKm,
        priceAmount,
        priceUnit,
        availability,
        status: verified ? status : "draft",
      }).unwrap();

      pushToast({
        tone: "success",
        title: status === "published" ? "Service published" : "Draft saved",
        description:
          status === "published"
            ? "Your service is now visible in the marketplace."
            : verified
              ? "Draft saved. Publish when you’re ready."
              : "Draft saved. It will appear in Services after admin verification.",
      });
      router.push("/provider/services");
    } catch (error) {
      pushToast({
        tone: "error",
        title: "Could not save service",
        description: getApiErrorMessage(error, "Please try again."),
      });
    }
  };

  return (
    <div className="space-y-[var(--space-6)]">
      <PageHeader
        tone="primary"
        eyebrow="New offering"
        title="Create a service"
        description={
          verified
            ? "Add details seekers need — including category, price, and map coverage."
            : "Save drafts while pending. Publishing unlocks after admin verification."
        }
      />
      <form
        ref={formRef}
        className="mx-auto w-full max-w-3xl space-y-[var(--space-5)] rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-4)] sm:p-[var(--space-6)]"
        onSubmit={(event) => {
          event.preventDefault();
          void submit(verified ? "published" : "draft");
        }}
        noValidate
      >
        {!verified ? (
          <div className="rounded-[var(--radius-lg)] border border-warning/30 bg-amber-50 px-[var(--space-4)] py-[var(--space-3)]">
            <Typography variant="body" className="text-warning">
              Verification pending — use <strong>Save draft</strong>. After an admin
              verifies you, drafts publish automatically and show in Services.
            </Typography>
          </div>
        ) : null}

        {Object.keys(errors).length > 0 ? (
          <div className="rounded-[var(--radius-lg)] border border-error/30 bg-red-50 px-[var(--space-4)] py-[var(--space-3)]">
            <Typography variant="body" className="text-error">
              Please complete the required fields highlighted below.
            </Typography>
          </div>
        ) : null}

        {categoriesError || citiesError ? (
          <div className="rounded-[var(--radius-lg)] border border-error/30 bg-red-50 px-[var(--space-4)] py-[var(--space-3)]">
            <Typography variant="body" className="text-error">
              Could not load cities or categories. Refresh the page and try again.
            </Typography>
          </div>
        ) : null}

        <ServiceFormFields
          title={title}
          cityId={cityId}
          cities={cities}
          citiesLoading={citiesLoading}
          parentCategoryId={parentCategoryId}
          categoryId={categoryId}
          categories={categories}
          categoriesLoading={categoriesLoading}
          description={description}
          specialty={specialty}
          imageUrl={imageUrl}
          address={address}
          priceAmount={priceAmount}
          priceUnit={priceUnit}
          radiusKm={radiusKm}
          lat={lat}
          lng={lng}
          availability={availability}
          errors={errors}
          onTitleChange={setTitle}
          onCityChange={setCityId}
          onParentCategoryChange={setParentCategoryId}
          onCategoryChange={setCategoryId}
          onDescriptionChange={setDescription}
          onSpecialtyChange={setSpecialty}
          onImageChange={setImageUrl}
          onAddressChange={setAddress}
          onPriceAmountChange={setPriceAmount}
          onPriceUnitChange={setPriceUnit}
          onRadiusChange={setRadiusKm}
          onCoordsChange={(coords) => {
            setLat(coords.lat);
            setLng(coords.lng);
          }}
          onAvailabilityChange={setAvailability}
        />

        <div className="flex flex-col gap-[var(--space-3)] sm:flex-row">
          <Button
            type="button"
            variant="secondary"
            disabled={
              isLoading ||
              categoriesLoading ||
              citiesLoading ||
              categoriesError ||
              citiesError
            }
            onClick={() => void submit("draft")}
          >
            {isLoading ? "Saving..." : "Save draft"}
          </Button>
          <Button
            type="button"
            disabled={
              isLoading ||
              !verified ||
              categoriesLoading ||
              citiesLoading ||
              categoriesError ||
              citiesError
            }
            onClick={() => void submit("published")}
          >
            {verified ? "Publish service" : "Publish locked"}
          </Button>
        </div>
      </form>
    </div>
  );
}
