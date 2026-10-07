"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePrototype } from "@/components/prototype/prototype-provider";
import {
  Button,
  Input,
  Label,
  PasswordInput,
  Typography,
  useToast,
} from "@/components/ui";
import { DEFAULT_ADMIN } from "@/lib/prototype-types";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function AdminLoginForm() {
  const router = useRouter();
  const { loginAdmin, adminAuthenticated, ready } = usePrototype();
  const { pushToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && adminAuthenticated) {
      router.replace("/admin/dashboard");
    }
  }, [adminAuthenticated, ready, router]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: { email?: string; password?: string } = {};

    if (!isValidEmail(email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!password) {
      nextErrors.password = "Enter your password.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setBusy(true);
    const result = loginAdmin(email, password);

    if (!result.ok) {
      setBusy(false);
      setErrors({
        password: "Incorrect email or password.",
      });
      pushToast({
        tone: "error",
        title: "Sign-in failed",
        description: "Check your admin email and password, then try again.",
      });
      return;
    }

    pushToast({
      tone: "success",
      title: "Welcome, admin",
      description: "You’re signed in to the Serveo console.",
    });
    router.push("/admin/dashboard");
  };

  if (!ready) {
    return <Typography variant="body">Loading...</Typography>;
  }

  if (adminAuthenticated) {
    return <Typography variant="body">Redirecting...</Typography>;
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-[var(--space-5)]">
      <form
        onSubmit={handleSubmit}
        className="space-y-[var(--space-5)] rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-6)] shadow-[0_20px_50px_-36px_rgba(109,40,217,0.4)]"
        noValidate
      >
        <div>
          <Typography variant="h2" className="mb-[var(--space-2)]">
            Admin sign in
          </Typography>
          <Typography variant="body" className="text-muted">
            Access identity verification and marketplace operations.
          </Typography>
        </div>

        <div>
          <Label htmlFor="admin-email">Email</Label>
          <Input
            id="admin-email"
            type="email"
            inputMode="email"
            value={email}
            autoComplete="username"
            invalid={Boolean(errors.email)}
            onChange={(event) => {
              setEmail(event.target.value);
              setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            placeholder={DEFAULT_ADMIN.email}
          />
          {errors.email ? (
            <Typography variant="caption" className="mt-2 block text-error">
              {errors.email}
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

        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Signing in..." : "Sign in"}
        </Button>

        <Typography variant="body" className="text-center text-muted">
          <Link href="/" className="font-medium text-primary hover:underline">
            Back to Serveo
          </Link>
        </Typography>
      </form>

      <div className="rounded-[var(--radius-xl)] border border-border bg-secondary/50 p-[var(--space-5)]">
        <Typography variant="label" className="mb-[var(--space-2)] block">
          Default admin credentials
        </Typography>
        <Typography variant="caption" className="mb-[var(--space-3)] block text-muted">
          Use these to open the console in this prototype.
        </Typography>
        <button
          type="button"
          className="flex w-full flex-col gap-1 rounded-[var(--radius-md)] border border-border bg-surface px-[var(--space-3)] py-[var(--space-3)] text-left transition-colors hover:border-primary"
          onClick={() => {
            setEmail(DEFAULT_ADMIN.email);
            setPassword(DEFAULT_ADMIN.password);
            setErrors({});
          }}
        >
          <Typography variant="label" className="block">
            {DEFAULT_ADMIN.email}
          </Typography>
          <Typography variant="caption" className="text-muted">
            Password: {DEFAULT_ADMIN.password}
          </Typography>
          <Typography variant="caption" className="text-primary">
            Click to fill
          </Typography>
        </button>
      </div>
    </div>
  );
}
