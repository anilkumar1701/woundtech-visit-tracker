import { motion } from "framer-motion";
import { Activity, CalendarClock, Stethoscope, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "./ui/Card";
import { Skeleton } from "./ui/Skeleton";
import { cn } from "../lib/utils";

interface Stat {
  label: string;
  value: number;
  icon: LucideIcon;
  gradient: string;
}

interface StatsRowProps {
  clinicianCount: number;
  patientCount: number;
  visitCount: number;
  visitsThisWeek: number;
  isLoading: boolean;
}

export function StatsRow({
  clinicianCount,
  patientCount,
  visitCount,
  visitsThisWeek,
  isLoading,
}: StatsRowProps) {
  const stats: Stat[] = [
    {
      label: "Clinicians",
      value: clinicianCount,
      icon: Stethoscope,
      gradient: "from-brand-400 to-brand-600",
    },
    {
      label: "Patients",
      value: patientCount,
      icon: Users,
      gradient: "from-accent-400 to-accent-600",
    },
    {
      label: "Total visits",
      value: visitCount,
      icon: Activity,
      gradient: "from-sky-400 to-sky-600",
    },
    {
      label: "Visits this week",
      value: visitsThisWeek,
      icon: CalendarClock,
      gradient: "from-amber-400 to-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
        >
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm",
                  stat.gradient
                )}
              >
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                  {stat.label}
                </p>
                {isLoading ? (
                  <Skeleton className="mt-1 h-6 w-10" />
                ) : (
                  <p className="text-xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                    {stat.value}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
