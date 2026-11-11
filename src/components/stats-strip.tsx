import type { FeedStats } from "@/lib/events";

import { NumberTicker } from "./number-ticker";

// Real numbers only: with no upcoming events there is nothing to brag about,
// so the strip stays out of the way.
export function StatsStrip({
  stats,
  labels,
}: {
  stats: FeedStats;
  labels: { events: string; organisers: string; states: string };
}) {
  if (stats.events === 0) return null;

  const items = [
    [stats.events, labels.events],
    [stats.organisers, labels.organisers],
    [stats.states, labels.states],
  ] as const;

  return (
    <dl className="mt-8 grid grid-cols-3 divide-x divide-hero-foreground/20 overflow-hidden rounded-2xl border border-hero-foreground/20 bg-hero-foreground/10">
      {items.map(([value, label]) => (
        <div key={label} className="px-4 py-3">
          <dd className="font-display text-2xl font-extrabold sm:text-3xl">
            <NumberTicker value={value} />
          </dd>
          <dt className="text-xs opacity-90 sm:text-sm">{label}</dt>
        </div>
      ))}
    </dl>
  );
}
