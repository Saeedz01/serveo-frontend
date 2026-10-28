export type SeekerDashboardTab =
  | "overview"
  | "requests"
  | "jobs"
  | "messages";

export function parseSeekerTab(tab?: string | null): SeekerDashboardTab {
  if (tab === "requests" || tab === "jobs" || tab === "messages") return tab;
  if (tab === "overview") return "overview";
  return "overview";
}
