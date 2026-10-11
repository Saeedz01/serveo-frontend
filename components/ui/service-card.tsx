import Image from "next/image";
import Link from "next/link";
import { Typography } from "@/components/ui/typography";
import { RatingSummary } from "@/components/ui/star-rating";
import { cx } from "@/lib/cx";

export type ServiceCardProps = {
  title: string;
  priceLabel: string;
  imageSrc: string;
  imageAlt: string;
  href?: string;
  className?: string;
  ratingAverage?: number;
  ratingCount?: number;
};

export function ServiceCard({
  title,
  priceLabel,
  imageSrc,
  imageAlt,
  href = "#services",
  className,
  ratingAverage = 0,
  ratingCount = 0,
}: ServiceCardProps) {
  return (
    <Link
      href={href}
      className={cx(
        "group flex flex-col overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface shadow-[0_10px_28px_-18px_rgba(10,10,10,0.35)] transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-[0_18px_36px_-20px_rgba(92,61,145,0.4)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-col items-center gap-[var(--space-2)] px-[var(--space-4)] py-[var(--space-5)] text-center">
        <Typography variant="h4" className="text-primary">
          {title}
        </Typography>
        <Typography variant="body" className="text-muted">
          {priceLabel}
        </Typography>
        {ratingCount > 0 ? (
          <RatingSummary average={ratingAverage} count={ratingCount} />
        ) : null}
      </div>
    </Link>
  );
}
