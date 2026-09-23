import { Router } from "express";
import { CliniciansController } from "../controllers/clinicians.controller";
import { asyncHandler } from "../utils/asyncHandler";

export const cliniciansRouter = Router();

cliniciansRouter.get("/", asyncHandler(CliniciansController.list));
cliniciansRouter.post("/", asyncHandler(CliniciansController.create));
