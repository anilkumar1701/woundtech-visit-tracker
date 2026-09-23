import { AppDataSource } from "../config/data-source";
import { Clinician } from "../entities/Clinician";
import { Patient } from "../entities/Patient";
import { Visit } from "../entities/Visit";
import { CreateVisitInput, ListVisitsQuery } from "../schemas";
import { AppError } from "../utils/AppError";

export const VisitsService = {
  async list(query: ListVisitsQuery): Promise<Visit[]> {
    const qb = AppDataSource.getRepository(Visit)
      .createQueryBuilder("visit")
      .leftJoinAndSelect("visit.clinician", "clinician")
      .leftJoinAndSelect("visit.patient", "patient")
      .orderBy("visit.visitDate", "DESC")
      .limit(query.limit ?? 200);

    if (query.clinicianId) {
      qb.andWhere("visit.clinician_id = :clinicianId", {
        clinicianId: query.clinicianId,
      });
    }
    if (query.patientId) {
      qb.andWhere("visit.patient_id = :patientId", {
        patientId: query.patientId,
      });
    }

    return qb.getMany();
  },

  async createVisit(input: CreateVisitInput): Promise<Visit> {
    return AppDataSource.transaction(async (manager) => {
      const clinician = await manager.findOne(Clinician, {
        where: { id: input.clinicianId },
        lock: { mode: "pessimistic_write" },
      });
      if (!clinician) {
        throw AppError.notFound("Clinician", input.clinicianId);
      }

      const patient = await manager.findOne(Patient, {
        where: { id: input.patientId },
        lock: { mode: "pessimistic_write" },
      });
      if (!patient) {
        throw AppError.notFound("Patient", input.patientId);
      }

      const visitDate = input.visitDate ?? new Date();

      const visit = manager.create(Visit, {
        clinicianId: clinician.id,
        patientId: patient.id,
        visitDate,
        notes: input.notes ?? null,
      });
      const saved = await manager.save(Visit, visit);

      if (!clinician.lastVisitAt || visitDate > clinician.lastVisitAt) {
        clinician.lastVisitAt = visitDate;
        await manager.save(Clinician, clinician);
      }
      if (!patient.lastVisitAt || visitDate > patient.lastVisitAt) {
        patient.lastVisitAt = visitDate;
        await manager.save(Patient, patient);
      }

      saved.clinician = clinician;
      saved.patient = patient;
      return saved;
    });
  },
};
