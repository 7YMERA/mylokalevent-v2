"use client";

import { useState } from "react";

// Drag (or use the arrow keys on) the handle to compare two screenshots of the
// same page. A range input sits invisibly on top, so it works with touch,
// mouse and keyboard without extra code.
export function BeforeAfter({
  before,
  after,
  beforeLabel,
  afterLabel,
  alt,
}: {
  before: string;
  after: string;
  beforeLabel: string;
  afterLabel: string;
  alt: string;
}) {
  const [pos, setPos] = useState(50);

  return (
    <div
      className="relative aspect-[16/10] w-full select-none overflow-hidden rounded-xl border border-border bg-surface-muted has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-ring"
      style={{ touchAction: "pan-y" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={after}
        alt={`${alt} (${afterLabel})`}
        className="absolute inset-0 size-full object-cover object-top"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={before}
        alt={`${alt} (${beforeLabel})`}
        className="absolute inset-0 size-full object-cover object-top"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      />
      <span className="absolute top-3 left-3 rounded-md bg-foreground px-2 py-1 font-mono text-xs text-background">
        {beforeLabel}
      </span>
      <span className="absolute top-3 right-3 rounded-md bg-foreground px-2 py-1 font-mono text-xs text-background">
        {afterLabel}
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-accent"
        style={{ left: `${pos}%` }}
      >
        <span className="absolute top-1/2 left-1/2 grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-accent text-accent-foreground">
          ⟷
        </span>
      </span>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(event) => setPos(Number(event.target.value))}
        aria-label={`${beforeLabel} / ${afterLabel}`}
        className="absolute inset-0 size-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}
