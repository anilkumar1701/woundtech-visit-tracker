import { Router } from "express";
import { PatientsController } from "../controllers/patients.controller";
import { asyncHandler } from "../utils/asyncHandler";

export const patientsRouter = Router();

patientsRouter.get("/", asyncHandler(PatientsController.list));
patientsRouter.post("/", asyncHandler(PatientsController.create));
