import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "../../lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const fieldBase =
  "w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 " +
  "focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 " +
  "dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500";

export function Input({ className, error, ...props }: InputProps) {
  return (
    <div className="w-full">
      <input
        className={cn(
          fieldBase,
          error ? "border-red-400" : "border-slate-300 dark:border-slate-700",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function TextArea({
  className,
  error,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) {
  return (
    <div className="w-full">
      <textarea
        className={cn(
          "resize-none",
          fieldBase,
          error ? "border-red-400" : "border-slate-300 dark:border-slate-700",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Label(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400"
      {...props}
    />
  );
}
