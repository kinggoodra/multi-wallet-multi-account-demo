"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";

type Props = {
  title?: string;
  description: string;
  tone?: "success" | "error" | "info";
  onClose?: () => void;
  duration?: number;
};

export default function SwipeToast({
  title,
  description,
  tone = "info",
  onClose,
  duration = 4500,
}: Props) {
  const [dismissed, setDismissed] = useState(false);
  const [startX, setStartX] = useState<number | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDismissed(true);
      onClose?.();
    }, duration);
    return () => window.clearTimeout(timer);
  }, [duration, onClose]);

  if (dismissed || !description) return null;

  const Icon = tone === "success" ? CheckCircle2 : tone === "error" ? XCircle : Info;

  return (
    <div
      role="status"
      aria-live="polite"
      onTouchStart={(event) => setStartX(event.touches[0]?.clientX ?? null)}
      onTouchEnd={(event) => {
        const endX = event.changedTouches[0]?.clientX;
        if (startX !== null && endX !== undefined && Math.abs(endX - startX) > 70) {
          setDismissed(true);
          onClose?.();
        }
        setStartX(null);
      }}
      className="fixed bottom-5 right-5 z-[100] flex w-[min(380px,calc(100vw-2rem))] items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 text-zinc-900 shadow-2xl animate-in slide-in-from-bottom-3 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
    >
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${tone === "success" ? "text-emerald-500" : tone === "error" ? "text-red-500" : "text-blue-500"}`} />
      <div className="min-w-0 flex-1">
        {title && <p className="text-sm font-semibold">{title}</p>}
        <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-300">{description}</p>
        <p className="mt-2 text-[11px] text-zinc-400">Swipe to dismiss</p>
      </div>
      <button type="button" aria-label="Dismiss notification" className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={() => { setDismissed(true); onClose?.(); }}>
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
