import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { type CreateClinicianPayload, cliniciansApi } from "../api/clinicians";
import { extractErrorMessage } from "../api/client";

export const cliniciansKey = ["clinicians"] as const;

export function useClinicians() {
  return useQuery({ queryKey: cliniciansKey, queryFn: cliniciansApi.list });
}

export function useCreateClinician() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateClinicianPayload) => cliniciansApi.create(payload),
    onSuccess: (clinician) => {
      queryClient.invalidateQueries({ queryKey: cliniciansKey });
      toast.success(`Added clinician "${clinician.name}"`);
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}
