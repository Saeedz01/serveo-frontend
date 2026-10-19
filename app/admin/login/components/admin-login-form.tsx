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
import { DEFAULT_ADMIN } from "@/lib/prototype-types";
import { useAdminLoginMutation } from "@/service/api";
import {
  getApiErrorMessage,
  persistAuthSession,
} from "@/service/auth-session";
import { getDevAdminCredentials } from "@/service/dev-credentials";
import { applyAuthUserToPrototype } from "@/service/sync-prototype-session";

function isValidPhone(value: string) {
  return /^[+()\d\s-]{8,}$/.test(value.trim());
}

export function AdminLoginForm() {
  const router = useRouter();
  const { commit, adminAuthenticated, ready } = usePrototype();
  const { pushToast } = useToast();
  const [adminLogin, { isLoading }] = useAdminLoginMutation();
  const [phone, setPhone] = useState<string>(DEFAULT_ADMIN.phone);
  const [password, setPassword] = useState<string>(DEFAULT_ADMIN.password);
  const [errors, setErrors] = useState<{ phone?: string; password?: string }>(
    {},
  );

  useEffect(() => {
    const creds = getDevAdminCredentials();
    setPhone(creds.phone);
    setPassword(creds.password);
  }, []);

  useEffect(() => {
    if (ready && adminAuthenticated) {
      router.replace("/admin/dashboard");
    }
  }, [adminAuthenticated, ready, router]);

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
      const result = await adminLogin({ phone, password }).unwrap();
      persistAuthSession(result);
      commit((prev) => applyAuthUserToPrototype(prev, result.user));
      pushToast({
        tone: "success",
        title: "Welcome, admin",
        description: "You’re signed in to the Serveo console.",
      });
      router.push("/admin/dashboard");
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Check your admin phone and password, then try again.",
      );
      setErrors({ password: message });
      pushToast({
        tone: "error",
        title: "Sign-in failed",
        description: message,
      });
    }
  };

  if (!ready) {
    return <Typography variant="body">Loading...</Typography>;
  }

  if (adminAuthenticated) {
    return <Typography variant="body">Redirecting...</Typography>;
  }

  return (
    <AuthStage
      eyebrow="Admin console"
      title="Sign in and manage the marketplace"
      description="Verify providers, review services, and keep Serveo operations on track."
      aside={
        <div className="rounded-[var(--radius-lg)] border border-white/20 bg-white/10 p-[var(--space-4)] backdrop-blur-sm">
          <div className="mb-[var(--space-2)] flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" aria-hidden />
            <Typography variant="label" className="text-white">
              Demo credentials ready
            </Typography>
          </div>
          <Typography variant="caption" className="block text-white/80">
            {DEFAULT_ADMIN.phone}
          </Typography>
          <Typography variant="caption" className="block text-white/80">
            Password · {DEFAULT_ADMIN.password}
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
            Admin console
          </Typography>
        </div>
        <div>
          <Typography variant="h2" className="mb-[var(--space-2)]">
            Welcome back
          </Typography>
          <Typography variant="body" className="text-muted">
            Use your admin phone and password to open the console.
          </Typography>
        </div>

        <div>
          <Label htmlFor="admin-phone">Phone number</Label>
          <Input
            id="admin-phone"
            type="tel"
            inputMode="tel"
            value={phone}
            autoComplete="tel"
            invalid={Boolean(errors.phone)}
            onChange={(event) => {
              setPhone(event.target.value);
              setErrors((prev) => ({ ...prev, phone: undefined }));
            }}
            placeholder={DEFAULT_ADMIN.phone}
          />
          {errors.phone ? (
            <Typography variant="caption" className="mt-2 block text-error">
              {errors.phone}
            </Typography>
          ) : null}
        </div>

        <div>
          <Label htmlFor="admin-password">Password</Label>
          <PasswordInput
            id="admin-password"
            value={password}
            autoComplete="current-password"
            invalid={Boolean(errors.password)}
            onChange={(event) => {
              setPassword(event.target.value);
              setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            placeholder="Enter admin password"
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
          <Link href="/" className="font-medium text-primary hover:underline">
            Back to Serveo
          </Link>
        </Typography>
      </form>
    </AuthStage>
  );
}
