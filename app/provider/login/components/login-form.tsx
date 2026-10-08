"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { usePrototype } from "@/components/prototype/prototype-provider";
import { AuthStage } from "@/components/provider/auth-stage";
import {
  Button,
  Input,
  Label,
  PasswordInput,
  Typography,
  useToast,
} from "@/components/ui";
import { DEFAULT_PROVIDER } from "@/lib/prototype-types";

function isValidPhone(value: string) {
  return /^[+()\d\s-]{8,}$/.test(value.trim());
}

export function LoginForm() {
  const router = useRouter();
  const { loginProvider, ready } = usePrototype();
  const { pushToast } = useToast();
  const [phone, setPhone] = useState<string>(DEFAULT_PROVIDER.phone);
  const [password, setPassword] = useState<string>(DEFAULT_PROVIDER.password);
  const [errors, setErrors] = useState<{ phone?: string; password?: string }>(
    {},
  );
  const [busy, setBusy] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: { phone?: string; password?: string } = {};

    if (!isValidPhone(phone)) {
      nextErrors.phone = "Enter a valid phone number.";
    }
    if (!password) {
      nextErrors.password = "Enter your password.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setBusy(true);
    const result = loginProvider(phone, password);

    if (!result.ok) {
      setBusy(false);
      if (result.reason === "not_found") {
        setErrors({ phone: "No provider found with this phone number." });
        pushToast({
          tone: "error",
          title: "Login failed",
          description: "Check the phone number or create a new provider account.",
        });
        return;
      }
      setErrors({ password: "Incorrect password. Please try again." });
      pushToast({
        tone: "error",
        title: "Incorrect password",
        description: "The password does not match this phone number.",
      });
      return;
    }

    pushToast({
      tone: "success",
      title: `Welcome back, ${result.provider.name}`,
      description: "You’re signed in to your provider workspace.",
    });
    router.push("/provider/dashboard");
  };

  if (!ready) {
    return <Typography variant="body">Loading...</Typography>;
  }

  return (
    <AuthStage
      eyebrow="Provider access"
      title="Sign in and get back to bookings"
      description="Manage services, availability, and requests from one workspace."
      aside={
        <div className="rounded-[var(--radius-lg)] border border-white/20 bg-white/10 p-[var(--space-4)] backdrop-blur-sm">
          <div className="mb-[var(--space-2)] flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" aria-hidden />
            <Typography variant="label" className="text-white">
              Demo credentials ready
            </Typography>
          </div>
          <Typography variant="caption" className="block text-white/80">
            {DEFAULT_PROVIDER.name}
          </Typography>
          <Typography variant="caption" className="block text-white/80">
            {DEFAULT_PROVIDER.phone} · {DEFAULT_PROVIDER.password}
          </Typography>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-[var(--space-5)]" noValidate>
        <div className="lg:hidden">
          <Typography variant="caption" className="mb-2 block font-semibold tracking-wide text-primary uppercase">
            Provider access
          </Typography>
        </div>
        <div>
          <Typography variant="h2" className="mb-[var(--space-2)]">
            Welcome back
          </Typography>
          <Typography variant="body" className="text-muted">
            Use your phone number and password to open your workspace.
          </Typography>
        </div>

        <div>
          <Label htmlFor="login-phone">Phone number</Label>
          <Input
            id="login-phone"
            type="tel"
            inputMode="tel"
            value={phone}
            autoComplete="tel"
            invalid={Boolean(errors.phone)}
            onChange={(event) => {
              setPhone(event.target.value);
              setErrors((prev) => ({ ...prev, phone: undefined }));
            }}
            placeholder={DEFAULT_PROVIDER.phone}
          />
          {errors.phone ? (
            <Typography variant="caption" className="mt-2 block text-error">
              {errors.phone}
            </Typography>
          ) : null}
        </div>

        <div>
          <Label htmlFor="login-password">Password</Label>
          <PasswordInput
            id="login-password"
            value={password}
            autoComplete="current-password"
            invalid={Boolean(errors.password)}
            onChange={(event) => {
              setPassword(event.target.value);
              setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            placeholder="Enter your password"
          />
          {errors.password ? (
            <Typography variant="caption" className="mt-2 block text-error">
              {errors.password}
            </Typography>
          ) : null}
        </div>

        <Button type="submit" className="w-full rounded-[var(--radius-full)]" disabled={busy}>
          {busy ? "Signing in..." : "Log in"}
        </Button>

        <Typography variant="body" className="text-center text-muted">
          New here?{" "}
          <Link
            href="/provider/signup"
            className="font-medium text-primary hover:underline"
          >
            Create a provider account
          </Link>
        </Typography>
      </form>
    </AuthStage>
  );
}
