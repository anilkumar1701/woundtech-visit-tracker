import { AppDataSource } from "../config/data-source";
import { Clinician } from "../entities/Clinician";
import { CreateClinicianInput } from "../schemas";

const repo = () => AppDataSource.getRepository(Clinician);

export const CliniciansService = {
  async list(): Promise<Clinician[]> {
    return repo().find({ order: { name: "ASC" } });
  },

  async create(input: CreateClinicianInput): Promise<Clinician> {
    const clinician = repo().create({
      name: input.name,
      specialty: input.specialty ?? null,
    });
    return repo().save(clinician);
  },
};
