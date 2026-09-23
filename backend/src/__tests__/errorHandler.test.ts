import { describe, expect, it, vi } from "vitest";
import { QueryFailedError } from "typeorm";
import { z, ZodError } from "zod";
import { errorHandler, notFoundHandler } from "../middleware/errorHandler";
import { AppError } from "../utils/AppError";

function makeRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

function makeQueryFailedError(code: string, message = "db error") {
  const driverError = Object.assign(new Error(message), { code });
  return new QueryFailedError("SELECT 1", [], driverError);
}

function parseError(): ZodError {
  const schema = z.object({ name: z.string().min(1) });
  const result = schema.safeParse({ name: "" });
  if (result.success) throw new Error("expected parse to fail");
  return result.error;
}

describe("notFoundHandler", () => {
  it("responds 404 naming the missing route", () => {
    const req: any = { method: "GET", originalUrl: "/api/nope" };
    const res = makeRes();

    notFoundHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: { message: "Route not found: GET /api/nope" },
    });
  });
});

describe("errorHandler", () => {
  it("maps a ZodError to 400 with flattened validation details", () => {
    const res = makeRes();

    errorHandler(parseError(), {} as any, res, vi.fn() as any);

    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body.error.message).toBe("Validation failed");
    expect(body.error.details).toBeDefined();
  });

  it("maps AppError to the status code it carries", () => {
    const res = makeRes();

    errorHandler(AppError.notFound("Clinician", "abc-123"), {} as any, res, vi.fn() as any);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: { message: 'Clinician with id "abc-123" was not found' },
    });
  });

  it("maps a foreign-key violation (23503) to 400", () => {
    const res = makeRes();

    errorHandler(makeQueryFailedError("23503"), {} as any, res, vi.fn() as any);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: { message: "Referenced clinician or patient does not exist" },
    });
  });

  it("maps a unique-constraint violation (23505) to 409", () => {
    const res = makeRes();

    errorHandler(makeQueryFailedError("23505"), {} as any, res, vi.fn() as any);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: { message: "Duplicate resource" } });
  });

  it("falls back to a generic 500 for an unrecognized database error code", () => {
    const res = makeRes();
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    errorHandler(makeQueryFailedError("55000"), {} as any, res, vi.fn() as any);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: { message: "Database error" } });
    consoleSpy.mockRestore();
  });

  it("falls back to 500 for a completely unrecognized error", () => {
    const res = makeRes();
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    errorHandler(new Error("something exploded"), {} as any, res, vi.fn() as any);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: { message: "Internal server error" } });
    consoleSpy.mockRestore();
  });
});
