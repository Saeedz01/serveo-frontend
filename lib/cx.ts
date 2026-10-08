import { twMerge } from "tailwind-merge";

export function cx(...parts: Array<string | false | null | undefined>) {
  return twMerge(parts.filter(Boolean).join(" "));
}
