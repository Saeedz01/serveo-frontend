import { ArrowRight } from "lucide-react";
import { Button, Typography } from "@/components/ui";

export function HeroCopy() {
  return (
    <div className="relative z-10 flex max-w-xl flex-col items-start">
      <Typography variant="brand" as="p" className="mb-[var(--space-5)] text-primary">
        Serveo
      </Typography>

      <Typography variant="display" className="mb-[var(--space-4)] max-w-[14ch]">
        Book trusted help for home tasks
      </Typography>

      <Typography variant="bodyLarge" className="mb-[var(--space-6)] max-w-[36ch]">
        Connect with vetted local pros for assembly, moving, cleaning, and
        repairs — in minutes, not days.
      </Typography>

      <div className="flex flex-col gap-[var(--space-3)] sm:flex-row">
        <Button as="a" href="#services" className="min-w-44 rounded-[var(--radius-full)] px-6">
          Find help
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
        <Button
          as="a"
          href="/provider/signup"
          variant="secondary"
          className="min-w-44 rounded-[var(--radius-full)] px-6"
        >
          Become provider
        </Button>

      </div>
    </div>
  );
}
