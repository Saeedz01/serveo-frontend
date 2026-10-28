"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/marketing/site-header";

/**
 * Marketing pages keep the public SiteHeader. The seeker dashboard uses its
 * own workspace shell, so the header is hidden there.
 */
export function MarketingChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideHeader = pathname.startsWith("/seeker/dashboard");

  return (
    <div className="flex min-h-full flex-1 flex-col">
      {hideHeader ? null : <SiteHeader />}
      {children}
    </div>
  );
}
