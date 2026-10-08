"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, IdCard } from "lucide-react";
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
import { AuthStage } from "@/components/provider/auth-stage";

function isValidPhone(value: string) {
  return /^[+()\d\s-]{8,}$/.test(value.trim());
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
    if (password.length < 8) nextErrors.password = "Use at least 8 characters.";
    if (!confirmPassword) nextErrors.confirmPassword = "Confirm your password.";
    else if (password !== confirmPassword) {
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
        nextErrors.phone = "An account with this phone already exists.";
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      pushToast({
        tone: "error",
        title: "Please fix the form",
        description: `${Object.keys(nextErrors).length} field(s) need attention.`,
      });
      window.requestAnimationFrame(() => {
        formRef.current
          ?.querySelector<HTMLElement>("[aria-invalid='true'], [data-invalid='true']")
          ?.focus();
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
        description: `Welcome, ${provider.name}. Pending admin verification.`,
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

  return (
    <AuthStage
      eyebrow="Join Serveo"
      title="Start earning with trusted local work"
      description="Create your provider account, upload ID once, and publish services after verification."
      aside={
        <ul className="space-y-[var(--space-3)]">
          {[
            { icon: IdCard, text: "One-time identity review by admin" },
            { icon: BadgeCheck, text: "Publish services once verified" },
          ].map((item) => (
            <li
              key={item.text}
              className="flex items-center gap-[var(--space-3)] rounded-[var(--radius-md)] border border-white/15 bg-white/10 px-[var(--space-3)] py-[var(--space-2)]"
            >
              <item.icon className="h-4 w-4 shrink-0" aria-hidden />
              <Typography variant="caption" className="text-white/90">
                {item.text}
              </Typography>
            </li>
          ))}
        </ul>
      }
    >
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="space-y-[var(--space-4)]"
        noValidate
      >
        <div>
          <Typography variant="h2" className="mb-[var(--space-2)]">
            Create your account
          </Typography>
          <Typography variant="body" className="text-muted">
            Phone and password for login. ID uploads are required for review.
          </Typography>
        </div>

        {Object.keys(errors).length > 0 ? (
          <div
            role="alert"
            className="rounded-[var(--radius-md)] border border-error/30 bg-red-50 px-[var(--space-4)] py-[var(--space-3)]"
          >
            <Typography variant="caption" className="text-error">
              Check the highlighted fields and try again.
            </Typography>
          </div>
        ) : null}

        <div className="grid gap-[var(--space-4)] sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="provider-name">Full name</Label>
            <Input
              id="provider-name"
              value={name}
              placeholder="Your full name"
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
          <div className="sm:col-span-2">
            <Label htmlFor="provider-phone">Phone number</Label>
            <Input
              id="provider-phone"
              type="tel"
              inputMode="tel"
              value={phone}
              placeholder="03000000000003"
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
          <div>
            <Label htmlFor="provider-password">Password</Label>
            <PasswordInput
              id="provider-password"
              value={password}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              invalid={Boolean(errors.password)}
              onChange={(event) => {
                setPassword(event.target.value);
                clearError("password");
              }}
            />
            {errors.password ? (
              <Typography variant="caption" className="mt-2 block text-error">
                {errors.password}
              </Typography>
            ) : null}
          </div>
          <div>
            <Label htmlFor="provider-confirm-password">Confirm password</Label>
            <PasswordInput
              id="provider-confirm-password"
              value={confirmPassword}
              placeholder="Re-enter password"
              autoComplete="new-password"
              invalid={Boolean(errors.confirmPassword)}
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

        <Button
          type="submit"
          className="w-full rounded-[var(--radius-full)]"
          disabled={busy}
        >
          {busy ? "Creating account..." : "Create account"}
        </Button>

        <Typography variant="body" className="text-center text-muted">
          Already registered?{" "}
          <Link
            href="/provider/login"
            className="font-medium text-primary hover:underline"
          >
            Log in
          </Link>
        </Typography>
      </form>
    </AuthStage>
  );
}
