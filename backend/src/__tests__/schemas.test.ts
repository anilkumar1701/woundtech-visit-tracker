import { describe, expect, it } from "vitest";
import {
  createClinicianSchema,
  createPatientSchema,
  createVisitSchema,
  listVisitsQuerySchema,
} from "../schemas";

describe("createClinicianSchema", () => {
  it("accepts a valid clinician", () => {
    const result = createClinicianSchema.parse({
      name: "Dr. Jane Doe",
      specialty: "Wound Care",
    });
    expect(result.name).toBe("Dr. Jane Doe");
  });

  it("rejects an empty name", () => {
    expect(() => createClinicianSchema.parse({ name: "" })).toThrow();
  });

  it("rejects a name over 150 characters", () => {
    expect(() =>
      createClinicianSchema.parse({ name: "a".repeat(151) })
    ).toThrow();
  });

  it("trims whitespace from the name", () => {
    const result = createClinicianSchema.parse({ name: "  Dr. Jane Doe  " });
    expect(result.name).toBe("Dr. Jane Doe");
  });

  it("treats specialty as optional", () => {
    const result = createClinicianSchema.parse({ name: "Dr. Jane Doe" });
    expect(result.specialty).toBeUndefined();
  });
});

describe("createPatientSchema", () => {
  it("rejects a malformed dateOfBirth", () => {
    expect(() =>
      createPatientSchema.parse({ name: "John Smith", dateOfBirth: "06/07/1954" })
    ).toThrow();
  });

  it("accepts an ISO dateOfBirth", () => {
    const result = createPatientSchema.parse({
      name: "John Smith",
      dateOfBirth: "1954-06-07",
    });
    expect(result.dateOfBirth).toBe("1954-06-07");
  });
});

describe("createVisitSchema", () => {
  const clinicianId = "5b1f8c1a-3b3a-4a3a-9c3a-1a2b3c4d5e6f";
  const patientId = "5b1f8c1a-3b3a-4a3a-9c3a-1a2b3c4d5e70";

  it("requires clinicianId and patientId to be UUIDs", () => {
    expect(() =>
      createVisitSchema.parse({ clinicianId: "not-a-uuid", patientId: "also-not" })
    ).toThrow();
  });

  it("accepts a minimal valid visit", () => {
    const result = createVisitSchema.parse({ clinicianId, patientId });
    expect(result.notes).toBeUndefined();
  });

  it("rejects notes over 2000 characters", () => {
    expect(() =>
      createVisitSchema.parse({ clinicianId, patientId, notes: "a".repeat(2001) })
    ).toThrow();
  });

  it("coerces a visitDate string into a Date", () => {
    const result = createVisitSchema.parse({
      clinicianId,
      patientId,
      visitDate: "2024-06-01",
    });
    expect(result.visitDate).toBeInstanceOf(Date);
  });

  it("requires both clinicianId and patientId to be present", () => {
    expect(() => createVisitSchema.parse({ clinicianId })).toThrow();
    expect(() => createVisitSchema.parse({ patientId })).toThrow();
  });
});

describe("listVisitsQuerySchema", () => {
  it("coerces limit to a number", () => {
    const result = listVisitsQuerySchema.parse({ limit: "50" });
    expect(result.limit).toBe(50);
  });

  it("rejects a limit over the max", () => {
    expect(() => listVisitsQuerySchema.parse({ limit: "5000" })).toThrow();
  });

  it("rejects a non-UUID clinicianId filter", () => {
    expect(() =>
      listVisitsQuerySchema.parse({ clinicianId: "not-a-uuid" })
    ).toThrow();
  });

  it("allows an empty query (no filters)", () => {
    const result = listVisitsQuerySchema.parse({});
    expect(result.clinicianId).toBeUndefined();
    expect(result.patientId).toBeUndefined();
    expect(result.limit).toBeUndefined();
  });
});
