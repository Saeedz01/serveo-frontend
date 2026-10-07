"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  FileUpload,
  Input,
  Label,
  PasswordInput,
  Typography,
  useToast,
} from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";

function isValidPhone(value: string) {
  return /^[+()\d\s-]{8,}$/.test(value.trim());
}

function isStrongEnough(password: string) {
  return password.length >= 8;
}

export function SignupForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const { registerProvider, state } = usePrototype();
  const { pushToast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [idFrontUrl, setIdFrontUrl] = useState("");
  const [idBackUrl, setIdBackUrl] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

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
    if (!isStrongEnough(password)) {
      nextErrors.password = "Password must be at least 8 characters.";
    }
    if (!confirmPassword) {
      nextErrors.confirmPassword = "Confirm your password.";
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }
    if (!idFrontUrl) nextErrors.idFrontUrl = "Upload the front of your ID.";
    if (!idBackUrl) nextErrors.idBackUrl = "Upload the back of your ID.";

    const normalized = phone.replace(/\D/g, "");
    if (normalized && isValidPhone(phone)) {
      const exists = state.providers.some(
        (provider) => provider.phone.replace(/\D/g, "") === normalized,
      );
      if (exists) {
        nextErrors.phone =
          "An account with this phone already exists. Please log in instead.";
      }
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const count = Object.keys(nextErrors).length;
      pushToast({
        tone: "error",
        title: "Please fix the form",
        description:
          count === 1
            ? "1 field needs your attention."
            : `${count} fields need your attention.`,
      });
      window.requestAnimationFrame(() => {
        const firstInvalid = formRef.current?.querySelector<HTMLElement>(
          "[aria-invalid='true'], [data-invalid='true']",
        );
        firstInvalid?.focus();
        firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }

    setBusy(true);
    try {
      const provider = registerProvider({
        name,
        phone,
        password,
        idFrontUrl,
        idBackUrl,
      });
      pushToast({
        tone: "success",
        title: "Account created",
        description: `Welcome, ${provider.name}. Your profile is pending admin verification.`,
      });
      router.push("/provider/dashboard");
    } catch {
      setBusy(false);
      pushToast({
        tone: "error",
        title: "Registration failed",
        description: "Something went wrong. Please try again.",
      });
    }
  };

  const errorCount = Object.keys(errors).length;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-2xl space-y-[var(--space-5)] rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-6)]"
      noValidate
    >
      <div>
        <Typography variant="h2" className="mb-[var(--space-2)]">
          Become a Serveo provider
        </Typography>
        <Typography variant="body" className="text-muted">
          Create your account with a phone number and password. An admin will
          verify your identity before you can publish services.
        </Typography>
      </div>

      {errorCount > 0 ? (
        <div
          role="alert"
          className="rounded-[var(--radius-md)] border border-error/30 bg-red-50 px-[var(--space-4)] py-[var(--space-3)]"
        >
          <Typography variant="label" className="mb-1 block text-error">
            Couldn’t create your account
          </Typography>
          <Typography variant="caption" className="block text-error">
            Check the highlighted fields below and try again.
          </Typography>
        </div>
      ) : null}

      <div>
        <Label htmlFor="provider-name">Full name</Label>
        <Input
          id="provider-name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            clearError("name");
          }}
          placeholder="Maya Chen"
          autoComplete="name"
          invalid={Boolean(errors.name)}
        />
        {errors.name ? (
          <Typography variant="caption" className="mt-2 block text-error">
            {errors.name}
          </Typography>
        ) : null}
      </div>

      <div>
        <Label htmlFor="provider-phone">Phone number</Label>
        <Input
          id="provider-phone"
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(event) => {
            setPhone(event.target.value);
            clearError("phone");
          }}
          placeholder="+1 (555) 000-0000"
          autoComplete="tel"
          invalid={Boolean(errors.phone)}
        />
        {errors.phone ? (
          <Typography variant="caption" className="mt-2 block text-error">
            {errors.phone}
          </Typography>
        ) : null}
      </div>

      <div className="grid gap-[var(--space-4)] sm:grid-cols-2">
        <div>
          <Label htmlFor="provider-password">Password</Label>
          <PasswordInput
            id="provider-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              clearError("password");
            }}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            invalid={Boolean(errors.password)}
          />
          {errors.password ? (
            <Typography variant="caption" className="mt-2 block text-error">
              {errors.password}
            </Typography>
          ) : (
            <Typography variant="caption" className="mt-2 block text-muted">
              Use at least 8 characters.
            </Typography>
          )}
        </div>
        <div>
          <Label htmlFor="provider-confirm-password">Confirm password</Label>
          <PasswordInput
            id="provider-confirm-password"
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              clearError("confirmPassword");
            }}
            placeholder="Re-enter password"
            autoComplete="new-password"
            invalid={Boolean(errors.confirmPassword)}
          />
          {errors.confirmPassword ? (
            <Typography variant="caption" className="mt-2 block text-error">
              {errors.confirmPassword}
            </Typography>
          ) : null}
        </div>
      </div>

      <div className="grid gap-[var(--space-4)] sm:grid-cols-2">
        <div data-invalid={errors.idFrontUrl ? "true" : undefined}>
          <FileUpload
            label="ID card — front"
            valueUrl={idFrontUrl}
            onChange={(url) => {
              setIdFrontUrl(url);
              clearError("idFrontUrl");
            }}
            error={errors.idFrontUrl}
          />
        </div>
        <div data-invalid={errors.idBackUrl ? "true" : undefined}>
          <FileUpload
            label="ID card — back"
            valueUrl={idBackUrl}
            onChange={(url) => {
              setIdBackUrl(url);
              clearError("idBackUrl");
            }}
            error={errors.idBackUrl}
          />
        </div>
      </div>

      <Button type="submit" className="w-full sm:w-auto" disabled={busy}>
        {busy ? "Creating account..." : "Create account"}
      </Button>

      <Typography variant="body" className="text-muted">
        Already registered?{" "}
        <Link
          href="/provider/login"
          className="font-medium text-primary hover:underline"
        >
          Log in to your account
        </Link>
      </Typography>
    </form>
  );
}
