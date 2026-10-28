import type { ReactNode } from "react";
import { MarketingChrome } from "@/components/marketing/marketing-chrome";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <MarketingChrome>{children}</MarketingChrome>;
}
