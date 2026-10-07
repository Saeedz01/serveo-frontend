"use client";

import Link from "next/link";
import { useState } from "react";
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
import { DEMO_PROVIDER_PASSWORD } from "@/lib/prototype-types";

function isValidPhone(value: string) {
  return /^[+()\d\s-]{8,}$/.test(value.trim());
}

const demoAccounts = [
  {
    name: "Maya Chen",
    phone: "+1 (555) 882-1044",
    password: DEMO_PROVIDER_PASSWORD,
    note: "Verified",
  },
  {
    name: "Alex Rivera",
    phone: "+1 (555) 210-4488",
    password: DEMO_PROVIDER_PASSWORD,
    note: "Pending",
  },
];

export function LoginForm() {
  const router = useRouter();
  const { loginProvider, ready } = usePrototype();
  const { pushToast } = useToast();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="mx-auto w-full max-w-md space-y-[var(--space-5)]">
      <form
        onSubmit={handleSubmit}
        className="space-y-[var(--space-5)] rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-6)] shadow-[0_20px_50px_-36px_rgba(109,40,217,0.4)]"
        noValidate
      >
        <div>
          <Typography variant="h2" className="mb-[var(--space-2)]">
            Provider login
          </Typography>
          <Typography variant="body" className="text-muted">
            Sign in with your registered phone number and password.
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
            placeholder="+1 (555) 882-1044"
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

        <Button type="submit" className="w-full" disabled={busy}>
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

      <div className="rounded-[var(--radius-xl)] border border-border bg-secondary/50 p-[var(--space-5)]">
        <Typography variant="label" className="mb-[var(--space-3)] block">
          Demo provider accounts
        </Typography>
        <Typography variant="caption" className="mb-[var(--space-3)] block text-muted">
          Password for all demos: {DEMO_PROVIDER_PASSWORD}
        </Typography>
        <ul className="space-y-[var(--space-2)]">
          {demoAccounts.map((account) => (
            <li key={account.phone}>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-[var(--radius-md)] border border-border bg-surface px-[var(--space-3)] py-[var(--space-2)] text-left transition-colors hover:border-primary"
                onClick={() => {
                  setPhone(account.phone);
                  setPassword(account.password);
                  setErrors({});
                }}
              >
                <span>
                  <Typography variant="label" className="block">
                    {account.name}
                  </Typography>
                  <Typography variant="caption" className="text-muted">
                    {account.phone}
                  </Typography>
                </span>
                <Typography variant="caption" className="text-primary">
                  {account.note}
                </Typography>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
