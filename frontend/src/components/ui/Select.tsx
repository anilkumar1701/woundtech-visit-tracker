import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export function Select({ className, error, children, ...props }: SelectProps) {
  return (
    <div className="w-full">
      <div className="relative">
        <select
          className={cn(
            "w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-9 text-sm text-slate-900",
            "focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500",
            "dark:bg-slate-900 dark:text-slate-100",
            error ? "border-red-400" : "border-slate-300 dark:border-slate-700",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
