import { Router } from "express";
import { cliniciansRouter } from "./clinicians.routes";
import { patientsRouter } from "./patients.routes";
import { visitsRouter } from "./visits.routes";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => res.json({ status: "ok" }));
apiRouter.use("/clinicians", cliniciansRouter);
apiRouter.use("/patients", patientsRouter);
apiRouter.use("/visits", visitsRouter);
