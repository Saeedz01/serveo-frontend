"use client";

import { useState } from "react";
import {
  Button,
  Input,
  Label,
  Textarea,
  Typography,
} from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
import type { MarketplaceItem } from "@/lib/marketplace";

type ServiceRequestFormProps = {
  service: MarketplaceItem;
};

function isValidPhone(value: string) {
  return /^[+()\d\s-]{8,}$/.test(value.trim());
}

export function ServiceRequestForm({ service }: ServiceRequestFormProps) {
  const { createBooking, state } = usePrototype();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const resolveProviderId = () => {
    if (service.providerId) return service.providerId;

    const matching = state.services.find(
      (item) =>
        item.status === "published" && item.categoryId === service.categoryId,
    );
    return matching?.providerId ?? "prov-verified";
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = "Enter your name.";
    if (!isValidPhone(phone)) nextErrors.phone = "Enter a valid phone number.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setBusy(true);
    createBooking({
      serviceId: service.id,
      providerId: resolveProviderId(),
      serviceTitle: service.title,
      seekerName: name,
      seekerPhone: phone,
      note,
    });
    setSubmitted(true);
    setBusy(false);
  };

  if (submitted) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-success/30 bg-emerald-50 p-[var(--space-5)]">
        <Typography variant="h3" className="mb-[var(--space-2)] text-success">
          Request sent
        </Typography>
        <Typography variant="body" className="text-foreground">
          Thanks, {name}. The provider has your phone number ({phone}) and will
          respond soon.
        </Typography>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-[var(--space-4)] rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-5)] shadow-[0_18px_40px_-34px_rgba(109,40,217,0.4)]"
      noValidate
    >
      <div>
        <Typography variant="h3" className="mb-[var(--space-2)]">
          Request this service
        </Typography>
        <Typography variant="body" className="text-muted">
          Share your contact details and the provider will get your booking
          request.
        </Typography>
      </div>

      <div>
        <Label htmlFor="seeker-name">Your name</Label>
        <Input
          id="seeker-name"
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
        <Label htmlFor="seeker-phone">Phone number</Label>
        <Input
          id="seeker-phone"
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

      <div>
        <Label htmlFor="seeker-note">Notes (optional)</Label>
        <Textarea
          id="seeker-note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Tell the provider what you need help with."
        />
      </div>

      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Sending..." : "Send booking request"}
      </Button>
    </form>
  );
}
