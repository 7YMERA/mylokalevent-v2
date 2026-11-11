import { notFound } from "next/navigation";

import { exportAuditLog } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";
import { toCsv } from "@/lib/csv";

// Admin-only CSV download of the newest audit entries. Anyone else gets a 404,
// the same as the audit page itself.
export async function GET() {
  const user = await getCurrentUser();
  if (user?.role !== "admin") notFound();

  const entries = await exportAuditLog();
  const body = toCsv([
    ["id", "time_utc", "actor", "action", "target_type", "target_id", "reason"],
    ...entries.map((e) => [
      e.id,
      e.createdAt,
      e.actorName,
      e.action,
      e.targetType,
      e.targetId,
      e.reason,
    ]),
  ]);

  return new Response(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="audit-log.csv"',
      "cache-control": "private, no-store",
    },
  });
}
