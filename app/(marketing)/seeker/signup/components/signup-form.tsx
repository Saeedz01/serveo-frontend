"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList } from "lucide-react";
import {
  Button,
  Input,
  Label,
  PasswordInput,
  Typography,
  useToast,
} from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
import { AuthStage } from "@/components/provider/auth-stage";
import { useSeekerSignupMutation } from "@/service/api";
import {
  getApiErrorMessage,
  persistAuthSession,
} from "@/service/auth-session";
import { applyAuthUserToPrototype } from "@/service/sync-prototype-session";

function isValidPhone(value: string) {
  return /^[+()\d\s-]{8,}$/.test(value.trim());
}

export function SeekerSignupForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const { commit, ready } = usePrototype();
  const { pushToast } = useToast();
  const [seekerSignup, { isLoading }] = useSeekerSignupMutation();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = "Enter your full name.";
    if (!isValidPhone(phone)) nextErrors.phone = "Enter a valid phone number.";
    if (password.length < 8) nextErrors.password = "Use at least 8 characters.";
    if (!confirmPassword) nextErrors.confirmPassword = "Confirm your password.";
    else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
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
          ?.querySelector<HTMLElement>(
            "[aria-invalid='true'], [data-invalid='true']",
          )
          ?.focus();
      });
      return;
    }

    try {
      const result = await seekerSignup({ name, phone, password }).unwrap();
      persistAuthSession(result);
      commit((prev) =>
        applyAuthUserToPrototype(prev, result.user, { password }),
      );
      pushToast({
        tone: "success",
        title: "Account created",
        description: `Welcome, ${result.user.name}. Track your requests anytime.`,
      });
      router.push("/seeker/dashboard");
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Check your details and try again.",
      );
      const lower = message.toLowerCase();
      if (lower.includes("phone")) {
        setErrors({ phone: message });
      }
      pushToast({
        tone: "error",
        title: "Could not create account",
        description: message,
      });
    }
  };

  if (!ready) {
    return <Typography variant="body">Loading...</Typography>;
  }

  return (
    <AuthStage
      eyebrow="Seeker account"
      title="Create an account to track activity"
      description="Register with name, phone, and password — or keep using Serveo as a guest with name and phone."
      aside={
        <div className="rounded-[var(--radius-lg)] border border-white/20 bg-white/10 p-[var(--space-4)] backdrop-blur-sm">
          <div className="mb-[var(--space-2)] flex items-center gap-2">
            <ClipboardList className="h-4 w-4" aria-hidden />
            <Typography variant="label" className="text-white">
              Why register?
            </Typography>
          </div>
          <Typography variant="caption" className="block text-white/80">
            Sign in on this browser to see your bookings and job posts without
            looking them up by phone each time.
          </Typography>
        </div>
      }
    >
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="space-y-[var(--space-5)]"
        noValidate
      >
        <div className="lg:hidden">
          <Typography
            variant="caption"
            className="mb-2 block font-semibold tracking-wide text-primary uppercase"
          >
            Seeker account
          </Typography>
        </div>
        <div>
          <Typography variant="h2" className="mb-[var(--space-2)]">
            Create your account
          </Typography>
          <Typography variant="body" className="text-muted">
            Guests can still book and post jobs. An account makes My requests
            easier to reopen.
          </Typography>
        </div>

        <div>
          <Label htmlFor="seeker-signup-name">Full name</Label>
          <Input
            id="seeker-signup-name"
            value={name}
            autoComplete="name"
            invalid={Boolean(errors.name)}
            onChange={(event) => {
              setName(event.target.value);
              clearError("name");
            }}
            placeholder="Jordan Lee"
          />
          {errors.name ? (
            <Typography variant="caption" className="mt-2 block text-error">
              {errors.name}
            </Typography>
          ) : null}
        </div>

        <div>
          <Label htmlFor="seeker-signup-phone">Phone number</Label>
          <Input
            id="seeker-signup-phone"
            type="tel"
            inputMode="tel"
            value={phone}
            autoComplete="tel"
            invalid={Boolean(errors.phone)}
            onChange={(event) => {
              setPhone(event.target.value);
              clearError("phone");
            }}
            placeholder="0300 1234567"
          />
          {errors.phone ? (
            <Typography variant="caption" className="mt-2 block text-error">
              {errors.phone}
            </Typography>
          ) : null}
        </div>

        <div>
          <Label htmlFor="seeker-signup-password">Password</Label>
          <PasswordInput
            id="seeker-signup-password"
            value={password}
            autoComplete="new-password"
            invalid={Boolean(errors.password)}
            onChange={(event) => {
              setPassword(event.target.value);
              clearError("password");
            }}
            placeholder="At least 8 characters"
          />
          {errors.password ? (
            <Typography variant="caption" className="mt-2 block text-error">
              {errors.password}
            </Typography>
          ) : null}
        </div>

        <div>
          <Label htmlFor="seeker-signup-confirm">Confirm password</Label>
          <PasswordInput
            id="seeker-signup-confirm"
            value={confirmPassword}
            autoComplete="new-password"
            invalid={Boolean(errors.confirmPassword)}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              clearError("confirmPassword");
            }}
            placeholder="Re-enter password"
          />
          {errors.confirmPassword ? (
            <Typography variant="caption" className="mt-2 block text-error">
              {errors.confirmPassword}
            </Typography>
          ) : null}
        </div>

        <Button
          type="submit"
          className="w-full rounded-[var(--radius-full)]"
          disabled={isLoading}
        >
          {isLoading ? "Creating account..." : "Create account"}
        </Button>

        <Typography variant="body" className="text-center text-muted">
          Already registered?{" "}
          <Link
            href="/seeker/login"
            className="font-medium text-primary hover:underline"
          >
            Log in
          </Link>
        </Typography>
      </form>
    </AuthStage>
  );
}
