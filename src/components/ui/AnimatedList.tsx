"use client";

import { useEffect, useState } from "react";

export type AnimatedListItem = {
  id: string;
  title: string;
  description?: string;
  meta?: string;
};

type Props = {
  items: AnimatedListItem[];
  selectedId?: string;
  onItemSelect?: (item: AnimatedListItem) => void;
  emptyLabel?: string;
};

export default function AnimatedList({
  items,
  selectedId,
  onItemSelect,
  emptyLabel = "Nothing to show yet.",
}: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [items.length]);

  if (items.length === 0) {
    return <p className="muted">{emptyLabel}</p>;
  }

  return (
    <div className="grid gap-2" role="listbox" aria-label="Wallet list">
      {items.map((item, index) => {
        const selected = item.id === selectedId;
        return (
          <button
            key={item.id}
            type="button"
            role="option"
            aria-selected={selected}
            onClick={() => onItemSelect?.(item)}
            className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 ${selected ? "border-zinc-500 bg-zinc-50 dark:bg-zinc-800" : "border-zinc-200 dark:border-zinc-700"} ${visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
            style={{ transitionDelay: `${Math.min(index, 8) * 45}ms` }}
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{item.title}</span>
              {item.description && <span className="mt-1 block truncate text-xs text-zinc-500">{item.description}</span>}
            </span>
            {item.meta && <span className="shrink-0 text-xs text-zinc-500">{item.meta}</span>}
          </button>
        );
      })}
    </div>
  );
}
