"use client";

import type { ReactNode } from "react";
import { Suspense, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/marketing/site-header";
import { SeekerShell } from "@/components/seeker/seeker-shell";
import { Typography } from "@/components/ui";
import { getStoredAuthUser } from "@/service/auth-session";
import { getAccessToken } from "@/service/splitApiSetting";

function SeekerWorkspace({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
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
    </div>
  );
}

/**
 * Marketing pages keep the public SiteHeader.
 * Dashboard always uses SeekerShell (path-based, SSR-safe).
 * Job pages switch to SeekerShell only after mount when a seeker session exists,
 * so localStorage auth never causes a hydration mismatch.
 */
export function MarketingChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/seeker/dashboard");
  const isJobsPath = pathname.startsWith("/jobs");
  const [seekerOnJobs, setSeekerOnJobs] = useState(false);

  useEffect(() => {
    if (!isJobsPath) {
      setSeekerOnJobs(false);
      return;
    }
    const authUser = getStoredAuthUser();
    const hasToken = Boolean(getAccessToken());
    setSeekerOnJobs(authUser?.role === "SEEKER" && hasToken);
  }, [isJobsPath, pathname]);

  if (isDashboard || seekerOnJobs) {
    return <SeekerWorkspace>{children}</SeekerWorkspace>;
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      {children}
    </div>
  );
}
