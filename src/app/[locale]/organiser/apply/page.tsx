import type { Metadata } from "next";
import { Suspense } from "react";

import { FormAlert } from "@/components/form-field";
import { SiteHeader } from "@/components/site-header";
import { StepBar, type Step } from "@/components/step-bar";
import { getLocale, getMessages, type Messages } from "@/i18n/messages";
import { pageMetadata } from "@/i18n/metadata";
import { requireUser } from "@/lib/auth";
import { getMyOrganiser } from "@/lib/organisers";

import { ApplyForm } from "./apply-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages();
  return pageMetadata("/organiser/apply", t.apply.title);
}

// Applied is always done; review and the final step follow the verification.
function applicationSteps(
  verification: "none" | "pending" | "verified" | "rejected",
  labels: Messages["apply"]["steps"],
): Step[] {
  return [
    { label: labels.applied, state: "done" },
    {
      label: labels.review,
      state:
        verification === "rejected"
          ? "failed"
          : verification === "verified"
            ? "done"
            : "current",
    },
    {
      label: verification === "rejected" ? labels.rejected : labels.verified,
      state:
        verification === "verified"
          ? "done"
          : verification === "rejected"
            ? "failed"
            : "todo",
    },
  ];
}

async function ApplyBody() {
  const [, locale, t, existing] = await Promise.all([
    requireUser(),
    getLocale(),
    getMessages(),
    getMyOrganiser(),
  ]);

  return (
    <>
      <h1 className="font-display text-3xl font-extrabold tracking-tight">
        {t.apply.heading}
      </h1>
      <p className="mt-2 mb-8 text-muted-foreground">{t.apply.lead}</p>

      {existing && (
        <div className="mb-6">
          <StepBar
            label={t.apply.steps.label}
            steps={applicationSteps(existing.verification, t.apply.steps)}
          />
        </div>
      )}

      {existing?.verification === "verified" ? (
        <FormAlert tone="success">{t.apply.alreadyVerified}</FormAlert>
      ) : existing ? (
        <FormAlert tone="success">{t.apply.alreadyApplied}</FormAlert>
      ) : (
        <ApplyForm
          locale={locale}
          t={{
            messages: t.messages,
            apply: t.apply,
            pleaseWait: t.common.pleaseWait,
          }}
        />
      )}
    </>
  );
}

export default async function ApplyPage() {
  const t = await getMessages();
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
        <Suspense
          fallback={
            <p className="text-muted-foreground">{t.common.pleaseWait}</p>
          }
        >
          <ApplyBody />
        </Suspense>
      </main>
    </>
  );
}
