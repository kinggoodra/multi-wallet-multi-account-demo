"use client";

import { type ReactNode } from "react";
import Link from "next/link";

type DockItem = { label: string; icon: ReactNode; href: string; active?: boolean };
/** React Bits Dock adapted as a responsive dashboard section navigator. */
export default function Dock({ items }: { items: DockItem[] }) {
  return <nav className="dock" aria-label="Dashboard sections">
    {items.map(item => <Link key={item.href} href={item.href} aria-current={item.active ? "page" : undefined} title={item.label}>
      <span className="dock-icon" aria-hidden="true">{item.icon}</span><span className="dock-label">{item.label}</span>
    </Link>)}
  </nav>;
}
