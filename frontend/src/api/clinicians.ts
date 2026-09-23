import type { Clinician } from "../types";
import { apiClient } from "./client";

export interface CreateClinicianPayload {
  name: string;
  specialty?: string | null;
}

export const cliniciansApi = {
  list: async (): Promise<Clinician[]> => {
    const { data } = await apiClient.get<Clinician[]>("/clinicians");
    return data;
  },
  create: async (payload: CreateClinicianPayload): Promise<Clinician> => {
    const { data } = await apiClient.post<Clinician>("/clinicians", payload);
    return data;
  },
};
