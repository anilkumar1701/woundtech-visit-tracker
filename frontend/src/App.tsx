import { differenceInCalendarDays } from "date-fns";
import { motion } from "framer-motion";
import { Stethoscope, Users } from "lucide-react";
import { useState } from "react";
import { Header } from "./components/Header";
import { PeoplePanel } from "./components/PeoplePanel";
import { StatsRow } from "./components/StatsRow";
import { VisitForm } from "./components/VisitForm";
import { VisitsTable } from "./components/VisitsTable";
import { useClinicians, useCreateClinician } from "./hooks/useClinicians";
import { useCreatePatient, usePatients } from "./hooks/usePatients";
import { useCreateVisit, useVisits } from "./hooks/useVisits";

export default function App() {
  const [clinicianFilter, setClinicianFilter] = useState("");
  const [patientFilter, setPatientFilter] = useState("");

  const cliniciansQuery = useClinicians();
  const patientsQuery = usePatients();
  // Unfiltered visits, used for the stats row - shares its cache entry with
  // the filtered query below whenever both filters are empty.
  const allVisitsQuery = useVisits({});
  const visitsQuery = useVisits({
    clinicianId: clinicianFilter,
    patientId: patientFilter,
  });

  const createClinician = useCreateClinician();
  const createPatient = useCreatePatient();
  const createVisit = useCreateVisit();

  const clinicians = cliniciansQuery.data ?? [];
  const patients = patientsQuery.data ?? [];
  const allVisits = allVisitsQuery.data ?? [];
  const visitsThisWeek = allVisits.filter(
    (v) => differenceInCalendarDays(new Date(), new Date(v.visitDate)) <= 7
  ).length;

  return (
    <div className="app-backdrop min-h-screen">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <StatsRow
            clinicianCount={clinicians.length}
            patientCount={patients.length}
            visitCount={allVisits.length}
            visitsThisWeek={visitsThisWeek}
            isLoading={cliniciansQuery.isLoading || patientsQuery.isLoading || allVisitsQuery.isLoading}
          />
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <PeoplePanel
              title="Clinicians"
              icon={Stethoscope}
              people={clinicians.map((c) => ({
                id: c.id,
                name: c.name,
                subtitle: c.specialty,
                lastVisitAt: c.lastVisitAt,
              }))}
              isLoading={cliniciansQuery.isLoading}
              addLabel="Add clinician"
              subtitlePlaceholder="Specialty (optional)"
              isAdding={createClinician.isPending}
              onAdd={(name, specialty) =>
                createClinician.mutateAsync({ name, specialty: specialty || null })
              }
            />
            <PeoplePanel
              title="Patients"
              icon={Users}
              people={patients.map((p) => ({
                id: p.id,
                name: p.name,
                subtitle: p.dateOfBirth,
                lastVisitAt: p.lastVisitAt,
              }))}
              isLoading={patientsQuery.isLoading}
              addLabel="Add patient"
              subtitlePlaceholder="Date of birth (optional)"
              subtitleType="date"
              isAdding={createPatient.isPending}
              onAdd={(name, dateOfBirth) =>
                createPatient.mutateAsync({ name, dateOfBirth: dateOfBirth || null })
              }
            />
          </div>

          <div className="space-y-6 lg:col-span-2">
            <VisitForm
              clinicians={clinicians}
              patients={patients}
              isSubmitting={createVisit.isPending}
              onSubmit={(values) =>
                createVisit.mutateAsync({
                  clinicianId: values.clinicianId,
                  patientId: values.patientId,
                  notes: values.notes || null,
                })
              }
            />
            <VisitsTable
              visits={visitsQuery.data}
              isLoading={visitsQuery.isLoading}
              clinicians={clinicians}
              patients={patients}
              clinicianFilter={clinicianFilter}
              patientFilter={patientFilter}
              onClinicianFilterChange={setClinicianFilter}
              onPatientFilterChange={setPatientFilter}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
