import Link from "next/link";

import { localePath } from "@/i18n/config";
import { getLocale, getMessages } from "@/i18n/messages";

type Section = "dashboard" | "events" | "organisers" | "audit";

// Tabs across the admin pages, so every one is a click from the others.
export async function AdminNav({ current }: { current: Section }) {
  const [locale, t] = await Promise.all([getLocale(), getMessages()]);
  const items: [Section, string][] = [
    ["dashboard", "/admin"],
    ["events", "/admin/events"],
    ["organisers", "/admin/organisers"],
    ["audit", "/admin/audit"],
  ];

  return (
    <nav aria-label={t.admin.nav.label} className="mb-8 overflow-x-auto">
      <ul className="flex gap-2">
        {items.map(([key, path]) => (
          <li key={key}>
            <Link
              href={localePath(locale, path)}
              aria-current={key === current ? "page" : undefined}
              className={`inline-block whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                key === current
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface hover:border-primary hover:bg-surface-muted"
              }`}
            >
              {t.admin.nav[key]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
