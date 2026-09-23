import { AnimatePresence, motion } from "framer-motion";
import { type LucideIcon, Plus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "./ui/Card";
import { EmptyState } from "./ui/EmptyState";
import { Input, Label } from "./ui/Input";
import { Skeleton } from "./ui/Skeleton";
import { avatarClasses, cn, initials } from "../lib/utils";

interface Person {
  id: string;
  name: string;
  subtitle: string | null;
  lastVisitAt: string | null;
}

interface PeoplePanelProps {
  title: string;
  icon: LucideIcon;
  people: Person[] | undefined;
  isLoading: boolean;
  addLabel: string;
  subtitlePlaceholder: string;
  subtitleType?: "text" | "date";
  onAdd: (name: string, subtitle: string) => Promise<unknown>;
  isAdding: boolean;
}

export function PeoplePanel({
  title,
  icon: Icon,
  people,
  isLoading,
  addLabel,
  subtitlePlaceholder,
  subtitleType = "text",
  onAdd,
  isAdding,
}: PeoplePanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onAdd(name.trim(), subtitle.trim());
    setName("");
    setSubtitle("");
    setShowForm(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          <CardTitle>{title}</CardTitle>
          {people && (
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {people.length}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className={cn(
            "inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors",
            showForm
              ? "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
              : "bg-brand-50 text-brand-600 hover:bg-brand-100 dark:bg-brand-500/15 dark:text-brand-400 dark:hover:bg-brand-500/25"
          )}
          aria-label={showForm ? "Cancel" : addLabel}
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>
      </CardHeader>

      <AnimatePresence initial={false}>
        {showForm && (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-b border-slate-100 dark:border-slate-800"
          >
            <div className="px-5 py-4">
              <div className="mb-3">
                <Label htmlFor={`${title}-name`}>Name</Label>
                <Input
                  id={`${title}-name`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  autoFocus
                  required
                />
              </div>
              <div className="mb-3">
                <Label htmlFor={`${title}-subtitle`}>{subtitlePlaceholder}</Label>
                <Input
                  id={`${title}-subtitle`}
                  type={subtitleType}
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder={subtitleType === "date" ? undefined : subtitlePlaceholder}
                  max={subtitleType === "date" ? new Date().toISOString().slice(0, 10) : undefined}
                />
              </div>
              <Button type="submit" size="sm" loading={isAdding} className="w-full">
                {addLabel}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <CardBody className="max-h-80 overflow-y-auto p-0">
        {isLoading ? (
          <div className="space-y-3 p-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </div>
        ) : !people || people.length === 0 ? (
          <EmptyState
            icon={Icon}
            title={`No ${title.toLowerCase()} yet`}
            description="Use the + button to add one"
          />
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {people.map((person) => (
              <li
                key={person.id}
                className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    avatarClasses(person.name)
                  )}
                >
                  {initials(person.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                    {person.name}
                  </p>
                  {person.subtitle && (
                    <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                      {person.subtitle}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
