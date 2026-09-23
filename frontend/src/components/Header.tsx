import { Activity, Moon, Sun } from "lucide-react";
import { useTheme } from "../lib/theme";

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/75 backdrop-blur-md dark:border-slate-800/70 dark:bg-slate-950/75">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-accent-600 shadow-sm shadow-brand-500/30">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Woundtech Patient Visit Tracker
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track clinician visits across your patient roster
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}
