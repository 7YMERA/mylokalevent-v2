"use client";

import { useEffect, useState } from "react";

// Cycles through a few words. The first word is what the server renders and
// what visitors who prefer reduced motion keep seeing. Screen readers get the
// whole list once instead of a changing word.
export function RotatingWord({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % words.length),
      2600,
    );
    return () => clearInterval(timer);
  }, [words.length]);

  return (
    <>
      <span className="sr-only">{words.join(", ")}</span>
      <span
        key={index}
        aria-hidden="true"
        className="inline-block word-in border-b-2 border-accent font-bold"
      >
        {words[index]}
      </span>
    </>
  );
}
