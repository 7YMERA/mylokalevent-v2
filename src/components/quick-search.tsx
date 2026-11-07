"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { format, localePath, type Locale } from "@/i18n/config";

export type QuickLink = { href: string; label: string };

export type QuickSearchLabels = {
  open: string;
  placeholder: string;
  searchFor: string; // contains {q}
  pages: string;
  empty: string;
};

// Ctrl/Cmd+K: type to search events, or jump straight to a page.
export function QuickSearch({
  locale,
  labels,
  links,
}: {
  locale: Locale;
  labels: QuickSearchLabels;
  links: QuickLink[];
}) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listId = useId();

  const term = query.trim();
  const matches = links.filter((link) =>
    link.label.toLowerCase().includes(term.toLowerCase()),
  );
  const items: QuickLink[] = [
    ...(term
      ? [
          {
            href: `${localePath(locale, "/events")}?q=${encodeURIComponent(term)}`,
            label: format(labels.searchFor, { q: term }),
          },
        ]
      : []),
    ...matches,
  ];

  function open() {
    setQuery("");
    setActive(0);
    if (!dialog.current?.open) dialog.current?.showModal();
  }

  function go(item: QuickLink | undefined) {
    if (!item) return;
    dialog.current?.close();
    router.push(item.href);
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (dialog.current?.open) dialog.current.close();
        else open();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label={labels.open}
        className="hidden h-8 items-center gap-2 rounded-full border border-border bg-surface px-2.5 sm:inline-flex text-sm text-muted-foreground hover:border-primary hover:text-foreground"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <kbd className="hidden rounded border border-border bg-surface-muted px-1.5 font-mono text-[11px] lg:inline">
          Ctrl K
        </kbd>
      </button>

      <dialog
        ref={dialog}
        aria-label={labels.open}
        className="m-0 mx-auto mt-[12vh] w-[min(36rem,calc(100%-2rem))] rounded-2xl border border-border bg-surface p-0 text-foreground shadow-2xl backdrop:bg-foreground/40"
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current?.close();
        }}
      >
        <input
          autoFocus
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActive((i) => Math.min(i + 1, items.length - 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActive((i) => Math.max(i - 1, 0));
            } else if (event.key === "Enter") {
              event.preventDefault();
              go(items[active]);
            }
          }}
          placeholder={labels.placeholder}
          aria-label={labels.placeholder}
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={`${listId}-${active}`}
          className="w-full rounded-t-2xl border-b border-border bg-transparent px-5 py-4 text-lg outline-none placeholder:text-muted-foreground"
        />
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {!term && (
            <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase">
              {labels.pages}
            </p>
          )}
          {items.length === 0 ? (
            <p className="px-3 py-3 text-muted-foreground">{labels.empty}</p>
          ) : (
            <ul id={listId} role="listbox">
              {items.map((item, index) => (
                <li
                  key={item.href + item.label}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === active}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => go(item)}
                  className={`cursor-pointer rounded-lg px-3 py-2.5 ${
                    index === active ? "bg-surface-muted" : ""
                  }`}
                >
                  {item.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </dialog>
    </>
  );
}
