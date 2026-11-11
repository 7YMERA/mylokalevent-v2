"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

export type DockItem = {
  key: "home" | "search" | "saved" | "account";
  href: string;
  label: string;
};

const icons: Record<DockItem["key"], string> = {
  home: "M3 11 12 3l9 8M5 10v10h14V10",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20 20l-3.5-3.5",
  saved: "M6 3h12v18l-6-4-6 4V3Z",
  account: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0",
};

// The tucked-away choice is remembered in this browser only.
const STORAGE_KEY = "dock-tucked";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function readTucked(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeTucked(value: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  } catch {
    // Private mode: the dock just forgets the choice on reload.
  }
  listeners.forEach((listener) => listener());
}

// Phone-only bottom bar for the feed pages. Hidden from the md breakpoint up,
// where the header already carries these links.
export function BottomDock({
  items,
  labels,
}: {
  items: DockItem[];
  labels: { nav: string; hide: string; show: string };
}) {
  const pathname = usePathname();
  const tucked = useSyncExternalStore(subscribe, readTucked, () => false);

  if (tucked) {
    return (
      <button
        type="button"
        onClick={() => writeTucked(false)}
        className="fixed right-3 bottom-3 z-20 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold shadow-md md:hidden"
      >
        {labels.show}
      </button>
    );
  }

  return (
    <nav
      aria-label={labels.nav}
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {items.map((item) => {
          const current = pathname === item.href;
          return (
            <li key={item.key} className="flex-1">
              <Link
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${
                  current ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={icons[item.key]} />
                </svg>
                {item.label}
              </Link>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={() => writeTucked(true)}
            aria-label={labels.hide}
            className="flex h-full items-center px-3 text-muted-foreground"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </li>
      </ul>
    </nav>
  );
}
