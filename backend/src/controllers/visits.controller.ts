import { Request, Response } from "express";
import { createVisitSchema, listVisitsQuerySchema } from "../schemas";
import { VisitsService } from "../services/visits.service";

export const VisitsController = {
  async list(req: Request, res: Response) {
    const query = listVisitsQuerySchema.parse(req.query);
    const visits = await VisitsService.list(query);
    res.json(visits);
  },

  async create(req: Request, res: Response) {
    const input = createVisitSchema.parse(req.body);
    const visit = await VisitsService.createVisit(input);
    res.status(201).json(visit);
  },
};
