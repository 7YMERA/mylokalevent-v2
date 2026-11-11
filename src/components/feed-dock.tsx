import { localePath } from "@/i18n/config";
import { getLocale, getMessages } from "@/i18n/messages";
import { getCurrentUser } from "@/lib/auth";

import { BottomDock } from "./bottom-dock";

// Reads the session to point Saved and Account at the right place, so render
// it inside <Suspense>.
export async function FeedDock() {
  const [user, locale, t] = await Promise.all([
    getCurrentUser(),
    getLocale(),
    getMessages(),
  ]);
  const d = t.header.dock;
  const account = user
    ? localePath(locale, "/account")
    : localePath(locale, "/sign-in");

  return (
    <BottomDock
      labels={{ nav: d.nav, hide: d.hide, show: d.show }}
      items={[
        { key: "home", href: localePath(locale), label: d.home },
        { key: "search", href: localePath(locale, "/events"), label: d.search },
        {
          key: "saved",
          href: user ? `${localePath(locale, "/account")}#saved` : account,
          label: d.saved,
        },
        { key: "account", href: account, label: d.account },
      ]}
    />
  );
}
