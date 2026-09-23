import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { extractErrorMessage } from "../api/client";
import { type CreateVisitPayload, type VisitsFilter, visitsApi } from "../api/visits";
import { cliniciansKey } from "./useClinicians";
import { patientsKey } from "./usePatients";

export function visitsKey(filter: VisitsFilter) {
  return ["visits", filter.clinicianId ?? null, filter.patientId ?? null] as const;
}

export function useVisits(filter: VisitsFilter) {
  return useQuery({
    queryKey: visitsKey(filter),
    queryFn: () => visitsApi.list(filter),
  });
}

export function useCreateVisit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateVisitPayload) => visitsApi.create(payload),
    onSuccess: () => {
      // A new visit also updates each clinician/patient's lastVisitAt, so
      // refresh those lists too, not just the visits table.
      queryClient.invalidateQueries({ queryKey: ["visits"] });
      queryClient.invalidateQueries({ queryKey: cliniciansKey });
      queryClient.invalidateQueries({ queryKey: patientsKey });
      toast.success("Visit recorded");
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}
