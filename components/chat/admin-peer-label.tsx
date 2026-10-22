"use client";

import { Badge, Typography } from "@/components/ui";
import { cx } from "@/lib/cx";

type AdminPeerLabelProps = {
  name: string;
  className?: string;
  nameClassName?: string;
};

/** Provider-facing label: admin display name + Admin badge. */
export function AdminPeerLabel({
  name,
  className,
  nameClassName,
}: AdminPeerLabelProps) {
  return (
    <span className={cx("inline-flex min-w-0 items-center gap-2", className)}>
      <Typography variant="label" className={cx("truncate", nameClassName)}>
        {name}
      </Typography>
      <Badge tone="primary" className="shrink-0 px-2 py-0.5">
        Admin
      </Badge>
    </span>
  );
}
