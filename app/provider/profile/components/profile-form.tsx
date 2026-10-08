"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Input,
  Label,
  PageHeader,
  PasswordInput,
  ProviderStatusChip,
  Typography,
  useToast,
} from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";

function isValidPhone(value: string) {
  return /^[+()\d\s-]{8,}$/.test(value.trim());
}

export function ProfileForm() {
  const { ready, currentProvider, updateProviderProfile } = usePrototype();
  const { pushToast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!currentProvider) return;
    setName(currentProvider.name);
    setPhone(currentProvider.phone);
  }, [currentProvider]);

  if (!ready) {
    return <Typography variant="body">Loading profile...</Typography>;
  }

  if (!currentProvider) {
    return (
      <Typography variant="body" className="text-muted">
        Sign in to edit your profile.
      </Typography>
    );
  }

  const clearError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!name.trim()) nextErrors.name = "Enter your full name.";
    if (!isValidPhone(phone)) nextErrors.phone = "Enter a valid phone number.";
    if (password) {
      if (password.length < 8) {
        nextErrors.password = "Password must be at least 8 characters.";
      }
      if (password !== confirmPassword) {
        nextErrors.confirmPassword = "Passwords do not match.";
      }
    } else if (confirmPassword) {
      nextErrors.password = "Enter a new password, or clear the confirm field.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      pushToast({
        tone: "error",
        title: "Couldn’t save profile",
        description: "Fix the highlighted fields and try again.",
      });
      return;
    }

    setBusy(true);
    const result = updateProviderProfile({
      name,
      phone,
      password: password || undefined,
    });
    setBusy(false);

    if (!result.ok) {
      if (result.reason === "phone_taken") {
        setErrors({
          phone: "Another provider already uses this phone number.",
        });
      }
      pushToast({
        tone: "error",
        title: "Update failed",
        description:
          result.reason === "phone_taken"
            ? "That phone number is already in use."
            : "Unable to update your profile. Please try again.",
      });
      return;
    }

    setPassword("");
    setConfirmPassword("");
    pushToast({
      tone: "success",
      title: "Profile updated",
      description: "Your account details were saved.",
    });
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-[var(--space-6)]">
      <PageHeader
        tone="primary"
        eyebrow="Account"
        title="Edit profile"
        description="Update your name, phone, or password. Identity documents can’t be changed here after signup."
        actions={<ProviderStatusChip status={currentProvider.status} />}
      />

      <form
        onSubmit={handleSubmit}
        className="space-y-[var(--space-5)] rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-6)]"
        noValidate
      >
        <div>
          <Label htmlFor="profile-name">Full name</Label>
          <Input
            id="profile-name"
            value={name}
            autoComplete="name"
            invalid={Boolean(errors.name)}
            onChange={(event) => {
              setName(event.target.value);
              clearError("name");
            }}
          />
          {errors.name ? (
            <Typography variant="caption" className="mt-2 block text-error">
              {errors.name}
            </Typography>
          ) : null}
        </div>

        <div>
          <Label htmlFor="profile-phone">Phone number</Label>
          <Input
            id="profile-phone"
            type="tel"
            inputMode="tel"
            value={phone}
            autoComplete="tel"
            invalid={Boolean(errors.phone)}
            onChange={(event) => {
              setPhone(event.target.value);
              clearError("phone");
            }}
          />
          {errors.phone ? (
            <Typography variant="caption" className="mt-2 block text-error">
              {errors.phone}
            </Typography>
          ) : null}
        </div>

        <div className="grid gap-[var(--space-4)] sm:grid-cols-2">
          <div>
            <Label htmlFor="profile-password">New password</Label>
            <PasswordInput
              id="profile-password"
              value={password}
              autoComplete="new-password"
              invalid={Boolean(errors.password)}
              placeholder="Leave blank to keep current"
              onChange={(event) => {
                setPassword(event.target.value);
                clearError("password");
              }}
            />
            {errors.password ? (
              <Typography variant="caption" className="mt-2 block text-error">
                {errors.password}
              </Typography>
            ) : (
              <Typography variant="caption" className="mt-2 block text-muted">
                Optional. Minimum 8 characters.
              </Typography>
            )}
          </div>
          <div>
            <Label htmlFor="profile-confirm-password">Confirm new password</Label>
            <PasswordInput
              id="profile-confirm-password"
              value={confirmPassword}
              autoComplete="new-password"
              invalid={Boolean(errors.confirmPassword)}
              placeholder="Re-enter if changing"
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                clearError("confirmPassword");
              }}
            />
            {errors.confirmPassword ? (
              <Typography variant="caption" className="mt-2 block text-error">
                {errors.confirmPassword}
              </Typography>
            ) : null}
          </div>
        </div>

        <div className="rounded-[var(--radius-md)] border border-border bg-secondary/40 px-[var(--space-4)] py-[var(--space-3)]">
          <Typography variant="label" className="mb-1 block">
            Identity documents
          </Typography>
          <Typography variant="caption" className="block text-muted">
            Front and back ID uploads are locked after registration and can only
            be reviewed by an admin.
          </Typography>
        </div>

        <Button type="submit" disabled={busy}>
          {busy ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </div>
  );
}
