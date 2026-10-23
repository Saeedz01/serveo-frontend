"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
import { DEFAULT_SEEKER } from "@/lib/prototype-types";
import { useSeekerLoginMutation } from "@/service/api";
import {
  getApiErrorMessage,
  persistAuthSession,
} from "@/service/auth-session";
import { getDevSeekerCredentials } from "@/service/dev-credentials";
import { applyAuthUserToPrototype } from "@/service/sync-prototype-session";

function isValidPhone(value: string) {
  return /^[+()\d\s-]{8,}$/.test(value.trim());
}

export function SeekerLoginForm() {
  const router = useRouter();
  const { commit, ready } = usePrototype();
  const { pushToast } = useToast();
  const [seekerLogin, { isLoading }] = useSeekerLoginMutation();
  const [phone, setPhone] = useState<string>(DEFAULT_SEEKER.phone);
  const [password, setPassword] = useState<string>(DEFAULT_SEEKER.password);
  const [errors, setErrors] = useState<{ phone?: string; password?: string }>(
    {},
  );

  useEffect(() => {
    const creds = getDevSeekerCredentials();
    setPhone(creds.phone);
    setPassword(creds.password);
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
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

    try {
      const result = await seekerLogin({ phone, password }).unwrap();
      persistAuthSession(result);
      commit((prev) =>
        applyAuthUserToPrototype(prev, result.user, { password }),
      );
      pushToast({
        tone: "success",
        title: `Welcome back, ${result.user.name}`,
        description: "You can track bookings and job posts from My requests.",
      });
      router.push("/seeker/dashboard");
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Check your phone number or create a seeker account.",
      );
      setErrors({ password: message });
      pushToast({
        tone: "error",
        title: "Login failed",
        description: message,
      });
    }
  };

  if (!ready) {
    return <Typography variant="body">Loading...</Typography>;
  }

  return (
    <AuthStage
      eyebrow="Seeker access"
      title="Sign in to track your requests"
      description="Use your phone number and password to see bookings and job posts."
      aside={
        <div className="rounded-[var(--radius-lg)] border border-white/20 bg-white/10 p-[var(--space-4)] backdrop-blur-sm">
          <div className="mb-[var(--space-2)] flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" aria-hidden />
            <Typography variant="label" className="text-white">
              Demo credentials ready
            </Typography>
          </div>
          <Typography variant="caption" className="block text-white/80">
            {DEFAULT_SEEKER.name}
          </Typography>
          <Typography variant="caption" className="block text-white/80">
            {DEFAULT_SEEKER.phone} · {DEFAULT_SEEKER.password}
          </Typography>
        </div>
      }
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-[var(--space-5)]"
        noValidate
      >
        <div className="lg:hidden">
          <Typography
            variant="caption"
            className="mb-2 block font-semibold tracking-wide text-primary uppercase"
          >
            Seeker access
          </Typography>
        </div>
        <div>
          <Typography variant="h2" className="mb-[var(--space-2)]">
            Welcome back
          </Typography>
          <Typography variant="body" className="text-muted">
            New to Serveo?{" "}
            <Link
              href="/seeker/signup"
              className="font-medium text-primary hover:underline"
            >
              Create a seeker account
            </Link>
            .
          </Typography>
        </div>

        <div>
          <Label htmlFor="seeker-login-phone">Phone number</Label>
          <Input
            id="seeker-login-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            invalid={Boolean(errors.phone)}
            onChange={(event) => {
              setPhone(event.target.value);
              setErrors((prev) => ({ ...prev, phone: undefined }));
            }}
            placeholder={DEFAULT_SEEKER.phone}
          />
          {errors.phone ? (
            <Typography variant="caption" className="mt-2 block text-error">
              {errors.phone}
            </Typography>
          ) : null}
        </div>

        <div>
          <Label htmlFor="seeker-login-password">Password</Label>
          <PasswordInput
            id="seeker-login-password"
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

        <Button
          type="submit"
          className="w-full rounded-[var(--radius-full)]"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Log in"}
        </Button>

        <Typography variant="body" className="text-center text-muted">
          New here?{" "}
          <Link
            href="/seeker/signup"
            className="font-medium text-primary hover:underline"
          >
            Create a seeker account
          </Link>
        </Typography>
      </form>
    </AuthStage>
  );
}
