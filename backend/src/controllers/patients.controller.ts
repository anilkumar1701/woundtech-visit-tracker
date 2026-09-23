import { Request, Response } from "express";
import { createPatientSchema } from "../schemas";
import { PatientsService } from "../services/patients.service";

export const PatientsController = {
  async list(_req: Request, res: Response) {
    const patients = await PatientsService.list();
    res.json(patients);
  },

  async create(req: Request, res: Response) {
    const input = createPatientSchema.parse(req.body);
    const patient = await PatientsService.create(input);
    res.status(201).json(patient);
  },
};
