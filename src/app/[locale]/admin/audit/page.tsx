import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AdminNav } from "@/components/admin-nav";
import { SiteHeader } from "@/components/site-header";
import { format, localePath } from "@/i18n/config";
import { formatEventDate } from "@/i18n/format";
import { getLocale, getMessages } from "@/i18n/messages";
import { listAuditLog } from "@/lib/admin";
import { requireUser } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages();
  return { title: t.admin.audit.title, robots: { index: false } };
}

// Reads searchParams (?page=) and the DB, so it is dynamic.
export const instant = false;

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function AuditBody({ searchParams }: Props) {
  const [user, locale, t, params] = await Promise.all([
    requireUser(),
    getLocale(),
    getMessages(),
    searchParams,
  ]);
  if (user.role !== "admin") notFound();

  const raw = Array.isArray(params.page) ? params.page[0] : params.page;
  const page = Math.max(1, Math.floor(Number(raw)) || 1);
  const { entries, hasMore } = await listAuditLog(page);
  const a = t.admin.audit;
  const actions = t.admin.actions as Record<string, string>;
  const base = localePath(locale, "/admin/audit");

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            {a.heading}
          </h1>
          <p className="mt-2 text-muted-foreground">{a.lead}</p>
        </div>
        {/* A file download, so a plain anchor rather than a client link. */}
        <a
          href={`${base}/export`}
          className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold hover:border-primary"
        >
          {a.export}
        </a>
      </div>

      {entries.length === 0 ? (
        <p className="mt-8 rounded-3xl border border-dashed border-border bg-surface-muted p-8 text-center text-muted-foreground">
          {a.empty}
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-muted text-muted-foreground">
              <tr>
                {[a.time, a.actor, a.action, a.target, a.reason].map((h) => (
                  <th key={h} scope="col" className="px-4 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {formatEventDate(entry.createdAt, locale)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {entry.actorName ?? t.admin.dashboard.system}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {actions[entry.action] ?? entry.action}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {entry.targetType} {entry.targetId.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {entry.reason ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <nav className="mt-6 flex items-center justify-between text-sm font-semibold">
        {page > 1 ? (
          <Link
            href={page === 2 ? base : `${base}?page=${page - 1}`}
            className="text-primary hover:underline"
          >
            ← {a.newer}
          </Link>
        ) : (
          <span />
        )}
        <span className="text-muted-foreground">
          {format(a.page, { n: String(page) })}
        </span>
        {hasMore ? (
          <Link
            href={`${base}?page=${page + 1}`}
            className="text-primary hover:underline"
          >
            {a.older} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </>
  );
}

export default async function AuditPage({ searchParams }: Props) {
  const t = await getMessages();
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">
        <Suspense
          fallback={
            <p className="text-muted-foreground">{t.common.pleaseWait}</p>
          }
        >
          <AdminNav current="audit" />
          <AuditBody searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}
