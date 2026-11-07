import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AdminNav } from "@/components/admin-nav";
import { SiteHeader } from "@/components/site-header";
import { Spotlight } from "@/components/spotlight";
import { format, localePath } from "@/i18n/config";
import { formatEventDate } from "@/i18n/format";
import { getLocale, getMessages } from "@/i18n/messages";
import { getAdminStats, listRecentAudit } from "@/lib/admin";
import { requireUser } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages();
  return { title: t.admin.dashboard.title, robots: { index: false } };
}

async function Dashboard() {
  const [user, locale, t] = await Promise.all([
    requireUser(),
    getLocale(),
    getMessages(),
  ]);

  // Admin-only. Anyone else gets a 404 with no hint the page exists.
  if (user.role !== "admin") notFound();

  const [stats, recent] = await Promise.all([
    getAdminStats(),
    listRecentAudit(8),
  ]);
  const d = t.admin.dashboard;
  const actions = t.admin.actions as Record<string, string>;

  const queues = [
    [d.queueEvents, stats.eventsInReview, "/admin/events"],
    [d.queueOrganisers, stats.organisersPending, "/admin/organisers"],
  ] as const;

  const numbers = [
    [d.eventsLive, String(stats.eventsLive)],
    [d.eventsAwaitingPayment, String(stats.eventsAwaitingPayment)],
    [d.organisersVerified, String(stats.organisersVerified)],
    [d.members, String(stats.members)],
    [d.paymentsPaid, String(stats.paymentsPaid)],
    [d.revenue, `RM${stats.revenueMyr}`],
  ] as const;

  return (
    <>
      <h1 className="font-display text-3xl font-extrabold tracking-tight">
        {d.heading}
      </h1>
      <p className="mt-2 text-muted-foreground">{d.lead}</p>

      <h2 className="mt-10 font-display text-xl font-bold tracking-tight">
        {d.queuesHeading}
      </h2>
      <Spotlight className="mt-4 grid gap-4 sm:grid-cols-2">
        {queues.map(([label, count, path]) => (
          <li
            key={path}
            data-glow
            className="glow-card relative rounded-2xl border border-border bg-surface p-5 shadow-sm"
          >
            <p className="text-sm font-semibold text-muted-foreground">
              {label}
            </p>
            <p className="mt-1 flex items-baseline gap-3">
              <span className="font-display text-4xl font-extrabold tabular-nums">
                {count}
              </span>
              {count === 0 && (
                <span className="rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-semibold text-success">
                  {d.allClear}
                </span>
              )}
            </p>
            <Link
              href={localePath(locale, path)}
              className="mt-3 inline-block text-sm font-semibold text-primary after:absolute after:inset-0 after:rounded-2xl hover:underline"
            >
              {d.openQueue} →
            </Link>
          </li>
        ))}
      </Spotlight>

      <h2 className="mt-10 font-display text-xl font-bold tracking-tight">
        {d.statsHeading}
      </h2>
      <dl className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {numbers.map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-border bg-surface p-5"
          >
            <dd className="font-display text-3xl font-extrabold tabular-nums">
              {value}
            </dd>
            <dt className="mt-1 text-sm text-muted-foreground">{label}</dt>
          </div>
        ))}
      </dl>

      <div className="mt-10 flex items-baseline justify-between gap-3">
        <h2 className="font-display text-xl font-bold tracking-tight">
          {d.activityHeading}
        </h2>
        <Link
          href={localePath(locale, "/admin/audit")}
          className="text-sm font-semibold text-primary hover:underline"
        >
          {d.viewAll} →
        </Link>
      </div>
      {recent.length === 0 ? (
        <p className="mt-4 rounded-3xl border border-dashed border-border bg-surface-muted p-6 text-center text-muted-foreground">
          {d.activityEmpty}
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-surface">
          {recent.map((entry) => (
            <li key={entry.id} className="px-5 py-3">
              <p className="font-semibold">
                {actions[entry.action] ?? entry.action}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(d.by, { name: entry.actorName ?? d.system })} ·{" "}
                {formatEventDate(entry.createdAt, locale)}
                {entry.reason ? ` · ${entry.reason}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default async function AdminPage() {
  const t = await getMessages();
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12">
        <Suspense
          fallback={
            <p className="text-muted-foreground">{t.common.pleaseWait}</p>
          }
        >
          <AdminNav current="dashboard" />
          <Dashboard />
        </Suspense>
      </main>
    </>
  );
}
