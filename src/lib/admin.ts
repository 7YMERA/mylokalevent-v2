import "server-only";

import { createClient } from "@/lib/supabase/server";

export type AdminStats = {
  eventsLive: number;
  eventsInReview: number;
  eventsAwaitingPayment: number;
  organisersPending: number;
  organisersVerified: number;
  members: number;
  paymentsPaid: number;
  revenueMyr: number;
};

// Headline numbers for /admin. Every read goes through RLS, which returns all
// rows to an admin (payments via the "admins read all" policy). Callers must
// check the role first; for anyone else these would just be their own rows.
export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient();
  const head = { count: "exact", head: true } as const;

  const [live, inReview, awaiting, pending, verified, members, payments] =
    await Promise.all([
      supabase.from("events").select("id", head).eq("status", "approved"),
      supabase.from("events").select("id", head).eq("status", "in_review"),
      supabase
        .from("events")
        .select("id", head)
        .eq("status", "awaiting_payment"),
      supabase
        .from("organisers")
        .select("id", head)
        .in("verification", ["none", "pending"]),
      supabase
        .from("organisers")
        .select("id", head)
        .eq("verification", "verified"),
      supabase.from("profiles").select("id", head),
      supabase
        .from("payments")
        .select("amount_myr")
        .eq("status", "paid")
        .limit(5000),
    ]);

  const paid = payments.data ?? [];
  return {
    eventsLive: live.count ?? 0,
    eventsInReview: inReview.count ?? 0,
    eventsAwaitingPayment: awaiting.count ?? 0,
    organisersPending: pending.count ?? 0,
    organisersVerified: verified.count ?? 0,
    members: members.count ?? 0,
    paymentsPaid: paid.length,
    revenueMyr: paid.reduce((sum, row) => sum + row.amount_myr, 0),
  };
}

export type AuditEntry = {
  id: number;
  action: string;
  targetType: string;
  targetId: string;
  reason: string | null;
  actorName: string | null;
  createdAt: string;
};

type AuditRow = {
  id: number;
  action: string;
  target_type: string;
  target_id: string;
  details: Record<string, unknown> | null;
  created_at: string;
  profiles: { display_name: string } | { display_name: string }[] | null;
};

function toEntry(row: AuditRow): AuditEntry {
  const actor = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  const reason = row.details?.reason;
  return {
    id: row.id,
    action: row.action,
    targetType: row.target_type,
    targetId: row.target_id,
    reason: typeof reason === "string" && reason ? reason : null,
    actorName: actor?.display_name ?? null,
    createdAt: row.created_at,
  };
}

export const AUDIT_PAGE_SIZE = 50;

// Newest first. Admin-only through RLS (the audit_log select policy).
export async function listAuditLog(
  page = 1,
  pageSize = AUDIT_PAGE_SIZE,
): Promise<{ entries: AuditEntry[]; hasMore: boolean }> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  // One extra row tells us whether there is a next page.
  const { data } = await supabase
    .from("audit_log")
    .select(
      "id, action, target_type, target_id, details, created_at, profiles(display_name)",
    )
    .order("id", { ascending: false })
    .range(from, from + pageSize);

  const rows = (data ?? []) as unknown as AuditRow[];
  return {
    entries: rows.slice(0, pageSize).map(toEntry),
    hasMore: rows.length > pageSize,
  };
}

// The most recent entries, for the dashboard's activity feed.
export async function listRecentAudit(limit = 8): Promise<AuditEntry[]> {
  return (await listAuditLog(1, limit)).entries;
}

// Up to `limit` newest entries, for the CSV export.
export async function exportAuditLog(limit = 5000): Promise<AuditEntry[]> {
  return (await listAuditLog(1, limit)).entries;
}
