import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Clinician, Patient } from "../types";
import { Button } from "./ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "./ui/Card";
import { Label, TextArea } from "./ui/Input";
import { Select } from "./ui/Select";

const visitFormSchema = z.object({
  clinicianId: z.string().min(1, "Select a clinician"),
  patientId: z.string().min(1, "Select a patient"),
  notes: z.string().max(2000).optional(),
});

type VisitFormValues = z.infer<typeof visitFormSchema>;

interface VisitFormProps {
  clinicians: Clinician[];
  patients: Patient[];
  onSubmit: (values: VisitFormValues) => Promise<unknown>;
  isSubmitting: boolean;
}

export function VisitForm({ clinicians, patients, onSubmit, isSubmitting }: VisitFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VisitFormValues>({
    resolver: zodResolver(visitFormSchema),
    defaultValues: { clinicianId: "", patientId: "", notes: "" },
  });

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
    reset();
  });

  const noPeopleYet = clinicians.length === 0 || patients.length === 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CalendarPlus className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          <CardTitle>Record a Visit</CardTitle>
        </div>
      </CardHeader>
      <CardBody>
        {noPeopleYet ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Add at least one clinician and one patient before recording a visit.
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="clinicianId">Clinician</Label>
                <Select
                  id="clinicianId"
                  error={errors.clinicianId?.message}
                  {...register("clinicianId")}
                >
                  <option value="">Select clinician…</option>
                  {clinicians.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.specialty ? ` — ${c.specialty}` : ""}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="patientId">Patient</Label>
                <Select
                  id="patientId"
                  error={errors.patientId?.message}
                  {...register("patientId")}
                >
                  <option value="">Select patient…</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <TextArea
                id="notes"
                rows={3}
                placeholder="Wound assessment, treatment given, follow-up plan…"
                error={errors.notes?.message}
                {...register("notes")}
              />
            </div>
            <Button type="submit" loading={isSubmitting}>
              Record visit
            </Button>
          </form>
        )}
      </CardBody>
    </Card>
  );
}
