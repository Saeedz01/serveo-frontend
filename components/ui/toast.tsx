"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, CircleAlert, X } from "lucide-react";
import { cx } from "@/lib/cx";

type ToastTone = "success" | "error" | "info";

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
};

type ToastContextValue = {
  pushToast: (toast: Omit<ToastItem, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toneStyles: Record<ToastTone, string> = {
  success: "border-success/30 bg-emerald-50 text-success",
  error: "border-error/30 bg-red-50 text-error",
  info: "border-primary/30 bg-primary-soft text-primary",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = useCallback((toast: Omit<ToastItem, "id">) => {
    const id = `toast-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((current) => [...current, { ...toast, id }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 4200);
  }, []);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(92vw,360px)] flex-col gap-2"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cx(
              "pointer-events-auto flex items-start gap-3 rounded-[var(--radius-lg)] border px-4 py-3 shadow-[0_16px_40px_-24px_rgba(10,10,10,0.45)]",
              toneStyles[toast.tone],
            )}
            role="status"
          >
            {toast.tone === "success" ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            ) : (
              <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[length:var(--text-sm)] font-semibold">
                {toast.title}
              </p>
              {toast.description ? (
                <p className="mt-1 text-[length:var(--text-xs)] opacity-90">
                  {toast.description}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              className="rounded-md p-1 opacity-70 hover:opacity-100"
              aria-label="Dismiss notification"
              onClick={() =>
                setToasts((current) =>
                  current.filter((item) => item.id !== toast.id),
                )
              }
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
