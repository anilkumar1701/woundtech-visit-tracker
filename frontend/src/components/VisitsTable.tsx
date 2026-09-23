import { differenceInCalendarDays, format, formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { ClipboardList } from "lucide-react";
import type { Clinician, Patient, Visit } from "../types";
import { avatarClasses, cn, initials } from "../lib/utils";
import { Badge } from "./ui/Badge";
import { Card, CardBody, CardHeader, CardTitle } from "./ui/Card";
import { EmptyState } from "./ui/EmptyState";
import { Select } from "./ui/Select";
import { Skeleton } from "./ui/Skeleton";

interface VisitsTableProps {
  visits: Visit[] | undefined;
  isLoading: boolean;
  clinicians: Clinician[];
  patients: Patient[];
  clinicianFilter: string;
  patientFilter: string;
  onClinicianFilterChange: (value: string) => void;
  onPatientFilterChange: (value: string) => void;
}

function recencyBadge(visitDate: string) {
  const days = differenceInCalendarDays(new Date(), new Date(visitDate));
  if (days <= 0) return <Badge tone="brand">Today</Badge>;
  if (days <= 7) return <Badge tone="brand">This week</Badge>;
  if (days <= 30) return <Badge tone="amber">This month</Badge>;
  return <Badge tone="slate">Older</Badge>;
}

export function VisitsTable({
  visits,
  isLoading,
  clinicians,
  patients,
  clinicianFilter,
  patientFilter,
  onClinicianFilterChange,
  onPatientFilterChange,
}: VisitsTableProps) {
  const isFiltered = Boolean(clinicianFilter || patientFilter);

  return (
    <Card>
      <CardHeader className="flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          <CardTitle>Visit History</CardTitle>
        </div>
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:justify-end">
          <Select
            value={clinicianFilter}
            onChange={(e) => onClinicianFilterChange(e.target.value)}
            className="sm:max-w-[200px]"
          >
            <option value="">All clinicians</option>
            {clinicians.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select
            value={patientFilter}
            onChange={(e) => onPatientFilterChange(e.target.value)}
            className="sm:max-w-[200px]"
          >
            <option value="">All patients</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        {isLoading ? (
          <div className="space-y-4 p-5">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : !visits || visits.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title={isFiltered ? "No visits match this filter" : "No visits recorded yet"}
            description={
              isFiltered
                ? "Try a different clinician or patient"
                : "Record your first visit above"
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800 dark:text-slate-500">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Patient</th>
                  <th className="px-5 py-3 font-medium">Clinician</th>
                  <th className="px-5 py-3 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {visits.map((visit, i) => (
                  <motion.tr
                    key={visit.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: Math.min(i, 8) * 0.03 }}
                    className="align-top hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <td className="whitespace-nowrap px-5 py-3">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {format(new Date(visit.visitDate), "MMM d, yyyy")}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                        <span>{formatDistanceToNow(new Date(visit.visitDate), { addSuffix: true })}</span>
                        {recencyBadge(visit.visitDate)}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                            avatarClasses(visit.patient.name)
                          )}
                        >
                          {initials(visit.patient.name)}
                        </div>
                        <span className="text-slate-700 dark:text-slate-300">
                          {visit.patient.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-700 dark:text-slate-300">
                      {visit.clinician.name}
                      {visit.clinician.specialty && (
                        <span className="ml-1 text-xs text-slate-400 dark:text-slate-500">
                          ({visit.clinician.specialty})
                        </span>
                      )}
                    </td>
                    <td className="max-w-xs px-5 py-3 text-slate-500 dark:text-slate-400">
                      {visit.notes || <span className="text-slate-300 dark:text-slate-600">—</span>}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
