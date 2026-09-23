import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type Tone = "brand" | "slate" | "amber";

const toneClasses: Record<Tone, string> = {
  brand:
    "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300",
  slate:
    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  amber:
    "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
};

export function Badge({
  className,
  tone = "brand",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
