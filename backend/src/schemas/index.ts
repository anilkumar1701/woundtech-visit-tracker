import { z } from "zod";

export const createClinicianSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(150),
  specialty: z.string().trim().max(150).optional().nullable(),
});
export type CreateClinicianInput = z.infer<typeof createClinicianSchema>;

export const createPatientSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(150),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "dateOfBirth must be YYYY-MM-DD")
    .optional()
    .nullable(),
});
export type CreatePatientInput = z.infer<typeof createPatientSchema>;

export const createVisitSchema = z.object({
  clinicianId: z.string().uuid("clinicianId must be a valid UUID"),
  patientId: z.string().uuid("patientId must be a valid UUID"),
  visitDate: z.coerce.date().optional(),
  notes: z.string().trim().max(2000).optional().nullable(),
});
export type CreateVisitInput = z.infer<typeof createVisitSchema>;

export const listVisitsQuerySchema = z.object({
  clinicianId: z.string().uuid().optional(),
  patientId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
});
export type ListVisitsQuery = z.infer<typeof listVisitsQuerySchema>;
