import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
      <div className="rounded-full bg-slate-100 p-3 dark:bg-slate-800">
        <Icon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
      </div>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{title}</p>
      {description && (
        <p className="text-xs text-slate-400 dark:text-slate-500">{description}</p>
      )}
    </div>
  );
}
