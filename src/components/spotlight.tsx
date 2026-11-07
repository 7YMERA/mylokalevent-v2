"use client";

import type { ReactNode } from "react";

// A list whose cards (marked data-glow) get a soft glow that follows the
// cursor. It only sets two CSS variables; the glow itself is pure CSS.
export function Spotlight({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <ul
      className={className}
      onPointerMove={(event) => {
        const card = (event.target as HTMLElement).closest<HTMLElement>(
          "[data-glow]",
        );
        if (!card) return;
        const box = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${event.clientX - box.left}px`);
        card.style.setProperty("--my", `${event.clientY - box.top}px`);
      }}
    >
      {children}
    </ul>
  );
}
