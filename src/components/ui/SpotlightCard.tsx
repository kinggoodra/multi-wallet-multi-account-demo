"use client";

import { type HTMLAttributes, useRef } from "react";

/** React Bits SpotlightCard: a pointer-following light on a card surface. */
export default function SpotlightCard({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLElement>(null);
  function move(event: React.PointerEvent<HTMLElement>) {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return;
    ref.current?.style.setProperty("--spotlight-x", `${event.clientX - bounds.left}px`);
    ref.current?.style.setProperty("--spotlight-y", `${event.clientY - bounds.top}px`);
  }
  return <section ref={ref} className={`relative isolate overflow-hidden rounded-[19px] border border-[#2b4832] bg-[linear-gradient(140deg,#10351f,#0c2416_75%)] before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:content-[''] before:bg-[radial-gradient(360px_circle_at_var(--spotlight-x,50%)_var(--spotlight-y,30%),#a4c26818,transparent_70%)] before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100 ${className}`} onPointerMove={move} {...props}>{children}</section>;
}
