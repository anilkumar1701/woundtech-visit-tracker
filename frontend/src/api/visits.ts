import type { Visit } from "../types";
import { apiClient } from "./client";

export interface VisitsFilter {
  clinicianId?: string;
  patientId?: string;
}

export interface CreateVisitPayload {
  clinicianId: string;
  patientId: string;
  visitDate?: string;
  notes?: string | null;
}

export const visitsApi = {
  list: async (filter: VisitsFilter): Promise<Visit[]> => {
    const { data } = await apiClient.get<Visit[]>("/visits", {
      params: {
        clinicianId: filter.clinicianId || undefined,
        patientId: filter.patientId || undefined,
      },
    });
    return data;
  },
  create: async (payload: CreateVisitPayload): Promise<Visit> => {
    const { data } = await apiClient.post<Visit>("/visits", payload);
    return data;
  },
};
