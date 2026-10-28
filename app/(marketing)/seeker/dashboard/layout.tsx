import type { ReactNode } from "react";
import { Suspense } from "react";
import { SeekerShell } from "@/components/seeker/seeker-shell";
import { Typography } from "@/components/ui";

export default function SeekerDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full flex-1 items-center justify-center bg-secondary">
          <Typography variant="body" className="text-muted">
            Loading seeker workspace...
          </Typography>
        </div>
      }
    >
      <SeekerShell>{children}</SeekerShell>
    </Suspense>
  );
}
