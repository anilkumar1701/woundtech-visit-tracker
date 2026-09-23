import { describe, expect, it } from "vitest";
import { AppError } from "../utils/AppError";

describe("AppError", () => {
  it("carries the given status code, message and details", () => {
    const err = new AppError(400, "Bad input", { field: "name" });

    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("AppError");
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe("Bad input");
    expect(err.details).toEqual({ field: "name" });
  });

  it("notFound() builds a 404 with a standard message and no details", () => {
    const err = AppError.notFound("Patient", "42");

    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Patient with id "42" was not found');
    expect(err.details).toBeUndefined();
  });
});
