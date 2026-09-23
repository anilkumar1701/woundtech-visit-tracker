import { NextFunction, Request, Response } from "express";
import { QueryFailedError } from "typeorm";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: { message: `Route not found: ${req.method} ${req.originalUrl}` },
  });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        message: "Validation failed",
        details: err.flatten(),
      },
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: { message: err.message, details: err.details },
    });
    return;
  }

  if (err instanceof QueryFailedError) {
    const code = (err as unknown as { code?: string }).code;
    if (code === "23503") {
      res.status(400).json({
        error: { message: "Referenced clinician or patient does not exist" },
      });
      return;
    }
    if (code === "23505") {
      res.status(409).json({ error: { message: "Duplicate resource" } });
      return;
    }
    console.error(err);
    res.status(500).json({ error: { message: "Database error" } });
    return;
  }

  console.error(err);
  res.status(500).json({ error: { message: "Internal server error" } });
}
