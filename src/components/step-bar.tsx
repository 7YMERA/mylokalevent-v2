export type Step = {
  label: string;
  state: "done" | "current" | "todo" | "failed";
};

const bar: Record<Step["state"], string> = {
  done: "bg-primary",
  current: "bg-gradient-to-r from-accent from-55% to-border to-55%",
  todo: "bg-border",
  failed: "bg-danger",
};

// A thin progress strip: one segment per step (done, current, to do).
export function StepBar({ label, steps }: { label: string; steps: Step[] }) {
  return (
    <ol aria-label={label} className="grid grid-cols-3 gap-2">
      {steps.map((step) => (
        <li
          key={step.label}
          aria-current={step.state === "current" ? "step" : undefined}
          className={`grid gap-1.5 text-xs font-semibold sm:text-sm ${
            step.state === "todo"
              ? "text-muted-foreground"
              : step.state === "failed"
                ? "text-danger"
                : "text-foreground"
          }`}
        >
          <span
            aria-hidden="true"
            className={`h-1.5 rounded-full ${bar[step.state]}`}
          />
          {step.label}
        </li>
      ))}
    </ol>
  );
}
