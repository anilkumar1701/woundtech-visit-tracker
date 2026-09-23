import type { Patient } from "../types";
import { apiClient } from "./client";

export interface CreatePatientPayload {
  name: string;
  dateOfBirth?: string | null;
}

export const patientsApi = {
  list: async (): Promise<Patient[]> => {
    const { data } = await apiClient.get<Patient[]>("/patients");
    return data;
  },
  create: async (payload: CreatePatientPayload): Promise<Patient> => {
    const { data } = await apiClient.post<Patient>("/patients", payload);
    return data;
  },
};
