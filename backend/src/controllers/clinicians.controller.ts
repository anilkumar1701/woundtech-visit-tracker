import { Request, Response } from "express";
import { createClinicianSchema } from "../schemas";
import { CliniciansService } from "../services/clinicians.service";

export const CliniciansController = {
  async list(_req: Request, res: Response) {
    const clinicians = await CliniciansService.list();
    res.json(clinicians);
  },

  async create(req: Request, res: Response) {
    const input = createClinicianSchema.parse(req.body);
    const clinician = await CliniciansService.create(input);
    res.status(201).json(clinician);
  },
};
