import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { extractErrorMessage } from "../api/client";
import { type CreatePatientPayload, patientsApi } from "../api/patients";

export const patientsKey = ["patients"] as const;

export function usePatients() {
  return useQuery({ queryKey: patientsKey, queryFn: patientsApi.list });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePatientPayload) => patientsApi.create(payload),
    onSuccess: (patient) => {
      queryClient.invalidateQueries({ queryKey: patientsKey });
      toast.success(`Added patient "${patient.name}"`);
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}
