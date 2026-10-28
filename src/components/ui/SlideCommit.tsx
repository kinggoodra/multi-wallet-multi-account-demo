"use client";

import { useRef, useState } from "react";
import { ArrowRight, Check, LoaderCircle } from "lucide-react";

type Props = {
  label?: string;
  doneLabel?: string;
  onConfirm: () => void | Promise<unknown>;
  disabled?: boolean;
};

export default function SlideCommit({
  label = "Slide to confirm",
  doneLabel = "Confirmed",
  onConfirm,
  disabled = false,
}: Props) {
  const [value, setValue] = useState(0);
  const [phase, setPhase] = useState<"idle" | "pending" | "done" | "error">("idle");
  const busy = useRef(false);

  async function confirm() {
    if (busy.current || disabled || phase === "done") return;
    busy.current = true;
    setPhase("pending");
    try {
      await onConfirm();
      setPhase("done");
    } catch {
      setPhase("error");
      setValue(0);
    } finally {
      busy.current = false;
      window.setTimeout(() => {
        setPhase("idle");
        setValue(0);
      }, phase === "error" ? 1400 : 1800);
    }
  }

  return (
    <div className={`w-full rounded-full bg-zinc-100 p-1 dark:bg-zinc-800 ${disabled ? "opacity-50" : ""}`}>
      <div className="flex items-center gap-2">
        <input
          aria-label={label}
          type="range"
          min={0}
          max={100}
          value={phase === "done" ? 100 : value}
          disabled={disabled || phase === "pending" || phase === "done"}
          onChange={(event) => {
            const next = Number(event.target.value);
            setValue(next);
            if (next >= 95) void confirm();
          }}
          className="min-w-0 flex-1 accent-zinc-900 dark:accent-zinc-100"
        />
        <span className="flex min-w-[118px] items-center justify-center gap-1.5 text-xs font-semibold" aria-live="polite">
          {phase === "pending" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : phase === "done" ? <Check className="h-4 w-4 text-emerald-600" /> : <ArrowRight className="h-4 w-4" />}
          {phase === "pending" ? "Working…" : phase === "done" ? doneLabel : phase === "error" ? "Try again" : label}
        </span>
      </div>
    </div>
  );
}
