import type { ReactNode } from "react";

/** React Bits Animated List: staggered spring-like row entrances. */
export default function AnimatedList({ children }: { children: ReactNode }) {
  return <div className="animated-list">{children}</div>;
}
