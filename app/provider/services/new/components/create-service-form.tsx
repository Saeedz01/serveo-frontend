"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePrototype } from "@/components/prototype/prototype-provider";
import {
  Button,
  EmptyState,
  Typography,
  useToast,
} from "@/components/ui";
import { defaultAvailability } from "@/lib/prototype-seed";
import type { PriceUnit } from "@/lib/prototype-types";
import { serviceCategories } from "@/lib/services-catalog";
import { ServiceFormFields } from "./service-form-fields";

const FIELD_ORDER = [
  "title",
  "categoryId",
  "description",
  "imageUrl",
  "priceAmount",
  "address",
  "radiusKm",
] as const;

export function CreateServiceForm() {
  const router = useRouter();
  const { pushToast } = useToast();
  const { ready, currentProvider, createService } = usePrototype();
  const formRef = useRef<HTMLFormElement>(null);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState(
    serviceCategories[0]?.id ?? "assembly",
  );
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [address, setAddress] = useState("");
  const [priceAmount, setPriceAmount] = useState(49);
  const [priceUnit, setPriceUnit] = useState<PriceUnit>("project");
  const [radiusKm, setRadiusKm] = useState(10);
  const [lat, setLat] = useState(40.7128);
  const [lng, setLng] = useState(-74.006);
  const [availability, setAvailability] = useState(defaultAvailability);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const verified = currentProvider?.status === "verified";

  if (!ready) {
    return <Typography variant="body">Loading form...</Typography>;
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
    if (!categoryId) nextErrors.categoryId = "Category is required.";
    if (!description.trim()) nextErrors.description = "Description is required.";
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

  const submit = (status: "draft" | "published") => {
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

    setBusy(true);
    createService({
      providerId: currentProvider.id,
      categoryId,
      title,
      description,
      imageUrl,
      address,
      lat,
      lng,
      radiusKm,
      priceAmount,
      priceUnit,
      availability,
      status: verified ? status : "draft",
    });

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

    window.setTimeout(() => {
      router.push("/provider/services");
    }, 450);
  };

  return (
    <form
      ref={formRef}
      className="mx-auto w-full max-w-3xl space-y-[var(--space-5)] rounded-[var(--radius-xl)] border border-border bg-surface/95 p-[var(--space-6)] shadow-[0_24px_60px_-40px_rgba(109,40,217,0.45)]"
      onSubmit={(event) => {
        event.preventDefault();
        submit(verified ? "published" : "draft");
      }}
      noValidate
    >
      <div>
        <Typography variant="h2" className="mb-[var(--space-2)]">
          Create a service
        </Typography>
        <Typography variant="body" className="text-muted">
          {verified
            ? "Add details seekers need — including category, price, and map coverage."
            : "You can save drafts while pending. Publishing unlocks after admin verification."}
        </Typography>
      </div>

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

      <ServiceFormFields
        title={title}
        categoryId={categoryId}
        description={description}
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
          disabled={busy}
          onClick={() => submit("draft")}
        >
          {busy ? "Saving..." : "Save draft"}
        </Button>
        <Button
          type="button"
          disabled={busy || !verified}
          onClick={() => submit("published")}
        >
          {verified ? "Publish service" : "Publish locked"}
        </Button>
      </div>
    </form>
  );
}
