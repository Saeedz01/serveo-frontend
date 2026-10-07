import type { ReactNode } from "react";
import { Container, Typography } from "@/components/ui";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <header className="border-b border-border">
        <Container className="flex min-h-14 items-center py-[var(--space-3)]">
          <Typography variant="nav" as="p">
            Serveo Admin
          </Typography>
        </Container>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
