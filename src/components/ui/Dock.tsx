"use client";

import { type ReactNode } from "react";
import Link from "next/link";

type DockItem = { label: string; icon: ReactNode; href: string; active?: boolean };
/** React Bits Dock adapted as a responsive dashboard section navigator. */
export default function Dock({ items }: { items: DockItem[] }) {
  return <nav className="grid gap-[5px] max-[680px]:flex max-[680px]:h-full max-[680px]:justify-around max-[680px]:gap-[6px]" aria-label="Dashboard sections">
    {items.map(item => <Link key={item.href} href={item.href} aria-current={item.active ? "page" : undefined} title={item.label} className={`flex h-11 items-center gap-3 rounded-[11px] px-[13px] text-xs text-[#87968b] transition-[background,color,transform] duration-200 hover:translate-x-0.5 hover:bg-white/[.04] hover:text-[#e7eee6] aria-[current=page]:bg-[#556b2f]/20 aria-[current=page]:text-[#e7f0e7] aria-[current=page]:shadow-[inset_3px_0_#9bb756] max-[680px]:h-[52px] max-[680px]:min-w-[75px] max-[680px]:flex-col max-[680px]:justify-center max-[680px]:gap-[3px] max-[680px]:rounded-[10px] max-[680px]:px-[9px] max-[680px]:py-[5px] max-[680px]:text-[9px] max-[680px]:hover:translate-x-0 max-[680px]:hover:-translate-y-0.5 max-[680px]:aria-[current=page]:shadow-[inset_0_2px_#9bb756]`}>
      <span className="grid place-items-center text-[#9bb756]" aria-hidden="true">{item.icon}</span><span>{item.label}</span>
    </Link>)}
  </nav>;
}
