import { Router } from "express";
import { VisitsController } from "../controllers/visits.controller";
import { asyncHandler } from "../utils/asyncHandler";

export const visitsRouter = Router();

visitsRouter.get("/", asyncHandler(VisitsController.list));
visitsRouter.post("/", asyncHandler(VisitsController.create));
