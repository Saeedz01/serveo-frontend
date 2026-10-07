"use client";

import { useRef, type ChangeEvent } from "react";
import { Upload } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { cx } from "@/lib/cx";

type FileUploadProps = {
  label: string;
  valueUrl?: string;
  onChange: (dataUrl: string) => void;
  accept?: string;
  error?: string;
  className?: string;
};

export function FileUpload({
  label,
  valueUrl,
  onChange,
  accept = "image/*",
  error,
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={className}>
      <Typography variant="label" className="mb-[var(--space-2)] block">
        {label}
      </Typography>
      <button
        type="button"
        aria-invalid={error ? true : undefined}
        onClick={() => inputRef.current?.click()}
        className={cx(
          "flex min-h-40 w-full flex-col items-center justify-center gap-[var(--space-2)] overflow-hidden rounded-[var(--radius-lg)] border border-dashed border-border bg-secondary/40 px-[var(--space-4)] py-[var(--space-5)] text-center transition-colors hover:border-primary hover:bg-primary-soft/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          error && "border-error bg-red-50/60",
        )}
      >
        {valueUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={valueUrl}
            alt={`${label} preview`}
            className="h-36 w-full rounded-[var(--radius-md)] object-cover"
          />
        ) : (
          <>
            <Upload className="h-5 w-5 text-primary" aria-hidden />
            <Typography variant="body" className="text-muted">
              Click to upload image
            </Typography>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={handleChange}
      />
      {error ? (
        <Typography variant="caption" className="mt-[var(--space-2)] block text-error">
          {error}
        </Typography>
      ) : null}
    </div>
  );
}
