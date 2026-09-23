import { AppDataSource } from "../config/data-source";
import { Patient } from "../entities/Patient";
import { CreatePatientInput } from "../schemas";

const repo = () => AppDataSource.getRepository(Patient);

export const PatientsService = {
  async list(): Promise<Patient[]> {
    return repo().find({ order: { name: "ASC" } });
  },

  async create(input: CreatePatientInput): Promise<Patient> {
    const patient = repo().create({
      name: input.name,
      dateOfBirth: input.dateOfBirth ?? null,
    });
    return repo().save(patient);
  },
};
