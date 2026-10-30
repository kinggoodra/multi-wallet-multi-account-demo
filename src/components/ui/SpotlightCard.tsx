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
  return <section ref={ref} className={`spotlight-card ${className}`} onPointerMove={move} {...props}>{children}</section>;
}
