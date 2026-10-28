"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
};

export default function Drawer({ open, onOpenChange, title, description, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" aria-label="Close drawer backdrop" className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={() => onOpenChange(false)} />
      <aside role="dialog" aria-modal="true" aria-labelledby="wallet-drawer-title" className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col border-l border-zinc-200 bg-white shadow-2xl animate-in slide-in-from-right duration-200 dark:border-zinc-800 dark:bg-zinc-950">
        <header className="flex items-start justify-between gap-4 border-b border-zinc-200 p-5 dark:border-zinc-800">
          <div>
            <h2 id="wallet-drawer-title" className="text-lg font-semibold">{title}</h2>
            {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
          </div>
          <button type="button" aria-label="Close drawer" onClick={() => onOpenChange(false)} className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"><X className="h-5 w-5" /></button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
      </aside>
    </div>
  );
}
