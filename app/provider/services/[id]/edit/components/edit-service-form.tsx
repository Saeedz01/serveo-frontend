"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePrototype } from "@/components/prototype/prototype-provider";
import {
  Button,
  EmptyState,
  PageHeader,
  Typography,
  useToast,
} from "@/components/ui";
import { ServiceFormFields } from "@/app/provider/services/new/components/service-form-fields";
import { defaultAvailability } from "@/lib/prototype-availability";
import type { PriceUnit, ProviderServiceStatus } from "@/lib/prototype-types";
import { isOtherServicesCategory } from "@/lib/suggest-category";
import {
  useGetServiceCategoriesQuery,
  useGetServiceQuery,
  useUpdateServiceMutation,
} from "@/service/api";
import { getApiErrorMessage } from "@/service/auth-session";

const FIELD_ORDER = [
  "title",
  "categoryId",
  "description",
  "specialty",
  "imageUrl",
  "priceAmount",
  "address",
  "radiusKm",
] as const;

export function EditServiceForm({ serviceId }: { serviceId: string }) {
  const router = useRouter();
  const { pushToast } = useToast();
  const { ready, currentProvider } = usePrototype();
  const { data: service, isLoading, isError } = useGetServiceQuery(serviceId, {
    skip: !ready || !currentProvider,
  });
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useGetServiceCategoriesQuery();
  const [updateService, { isLoading: saving }] = useUpdateServiceMutation();
  const formRef = useRef<HTMLFormElement>(null);
  const [hydrated, setHydrated] = useState(false);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [address, setAddress] = useState("");
  const [priceAmount, setPriceAmount] = useState(49);
  const [priceUnit, setPriceUnit] = useState<PriceUnit>("project");
  const [radiusKm, setRadiusKm] = useState(10);
  const [lat, setLat] = useState(40.7128);
  const [lng, setLng] = useState(-74.006);
  const [availability, setAvailability] = useState(defaultAvailability);
  const [status, setStatus] = useState<ProviderServiceStatus>("draft");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!service || hydrated) return;
    setTitle(service.title);
    setCategoryId(service.categoryId);
    setDescription(service.description);
    setSpecialty(service.specialty ?? "");
    setImageUrl(service.imageUrl);
    setAddress(service.address);
    setPriceAmount(service.priceAmount);
    setPriceUnit(service.priceUnit);
    setRadiusKm(service.radiusKm);
    setLat(service.lat);
    setLng(service.lng);
    setAvailability(service.availability.map((slot) => ({ ...slot })));
    setStatus(service.status);
    setHydrated(true);
  }, [hydrated, service]);

  if (!ready || isLoading) {
    return <Typography variant="body">Loading service...</Typography>;
  }

  if (!currentProvider) {
    return (
      <EmptyState
        title="Sign in required"
        description="Log in as a provider to edit services."
        action={
          <Button as="a" href="/provider/login">
            Provider login
          </Button>
        }
      />
    );
  }

  if (isError || !service) {
    return (
      <EmptyState
        title="Service not found"
        description="This service may have been deleted or belongs to another account."
        action={
          <Button as="a" href="/provider/services" variant="secondary">
            Back to services
          </Button>
        }
      />
    );
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!title.trim()) nextErrors.title = "Title is required.";
    if (!categoryId) nextErrors.categoryId = "Category is required.";
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

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const firstKey = FIELD_ORDER.find((key) => nextErrors[key]);
      formRef.current
        ?.querySelector(`[data-field="${firstKey}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      pushToast({
        tone: "error",
        title: "Missing required fields",
        description: "Please fix the highlighted fields and try again.",
      });
      return;
    }

    try {
      await updateService({
        id: serviceId,
        body: {
          categoryId,
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
          status,
        },
      }).unwrap();
      pushToast({
        tone: "success",
        title: "Service updated",
        description: `"${title.trim()}" was saved.`,
      });
      router.push("/provider/services");
    } catch (error) {
      pushToast({
        tone: "error",
        title: "Update failed",
        description: getApiErrorMessage(error, "Please try again."),
      });
    }
  };

  return (
    <div className="space-y-[var(--space-6)]">
      <PageHeader
        tone="primary"
        eyebrow="Edit offering"
        title="Edit service"
        description="Update details seekers see, including image, price, and coverage."
        actions={
          <Button
            as="a"
            href="/provider/services"
            variant="inverse"
            className="rounded-[var(--radius-full)]"
          >
            Back to services
          </Button>
        }
      />

      <form
        ref={formRef}
        onSubmit={(event) => {
          void handleSave(event);
        }}
        className="mx-auto w-full max-w-3xl space-y-[var(--space-5)] rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-4)] sm:p-[var(--space-6)]"
        noValidate
      >
        {categoriesError ? (
          <div className="rounded-[var(--radius-lg)] border border-error/30 bg-red-50 px-[var(--space-4)] py-[var(--space-3)]">
            <Typography variant="body" className="text-error">
              Could not load service categories. Refresh the page and try again.
            </Typography>
          </div>
        ) : null}

        <ServiceFormFields
          title={title}
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
            type="submit"
            disabled={saving || categoriesLoading || categoriesError}
            className="rounded-[var(--radius-full)]"
          >
            {saving ? "Saving..." : "Save changes"}
          </Button>
          <Button
            as="a"
            href="/provider/services"
            variant="secondary"
            className="rounded-[var(--radius-full)]"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
