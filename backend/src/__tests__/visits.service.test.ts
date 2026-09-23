import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppDataSource } from "../config/data-source";
import { Clinician } from "../entities/Clinician";
import { Patient } from "../entities/Patient";
import { Visit } from "../entities/Visit";
import { VisitsService } from "../services/visits.service";

vi.mock("../entities/Clinician", () => ({ Clinician: class Clinician {} }));
vi.mock("../entities/Patient", () => ({ Patient: class Patient {} }));
vi.mock("../entities/Visit", () => ({ Visit: class Visit {} }));

function makeManager(findOneImpl: (...args: unknown[]) => unknown) {
  return {
    findOne: vi.fn(findOneImpl),
    create: vi.fn((_entity: unknown, data: unknown) => data),
    save: vi.fn(async (_entity: unknown, data: unknown) => data),
  };
}

function useManager(manager: ReturnType<typeof makeManager>) {
  vi.spyOn(AppDataSource, "transaction").mockImplementation(
    ((fn: (manager: unknown) => unknown) => fn(manager)) as never
  );
}

const clinicianId = "11111111-1111-1111-1111-111111111111";
const patientId = "22222222-2222-2222-2222-222222222222";

describe("VisitsService.createVisit", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects with a 404 AppError when the clinician doesn't exist", async () => {
    const manager = makeManager(() => null);
    useManager(manager);

    await expect(
      VisitsService.createVisit({ clinicianId, patientId })
    ).rejects.toMatchObject({ statusCode: 404, message: expect.stringContaining("Clinician") });
  });

  it("rejects with a 404 AppError when the patient doesn't exist", async () => {
    const clinician = { id: clinicianId, lastVisitAt: null };
    const manager = makeManager(
      vi.fn().mockResolvedValueOnce(clinician).mockResolvedValueOnce(null)
    );
    useManager(manager);

    await expect(
      VisitsService.createVisit({ clinicianId, patientId })
    ).rejects.toMatchObject({ statusCode: 404, message: expect.stringContaining("Patient") });
  });

  it("locks both the clinician and patient row for the duration of the transaction", async () => {
    const clinician = { id: clinicianId, lastVisitAt: null };
    const patient = { id: patientId, lastVisitAt: null };
    const findOne = vi.fn().mockResolvedValueOnce(clinician).mockResolvedValueOnce(patient);
    const manager = makeManager(findOne);
    useManager(manager);

    await VisitsService.createVisit({ clinicianId, patientId });

    expect(findOne).toHaveBeenNthCalledWith(1, Clinician, {
      where: { id: clinicianId },
      lock: { mode: "pessimistic_write" },
    });
    expect(findOne).toHaveBeenNthCalledWith(2, Patient, {
      where: { id: patientId },
      lock: { mode: "pessimistic_write" },
    });
  });

  it("advances lastVisitAt on both clinician and patient when the visit is newer", async () => {
    const clinician = { id: clinicianId, lastVisitAt: new Date("2020-01-01") };
    const patient = { id: patientId, lastVisitAt: null };
    const findOne = vi.fn().mockResolvedValueOnce(clinician).mockResolvedValueOnce(patient);
    const manager = makeManager(findOne);
    useManager(manager);

    const visitDate = new Date("2024-06-01");
    await VisitsService.createVisit({ clinicianId, patientId, visitDate });

    expect(clinician.lastVisitAt).toEqual(visitDate);
    expect(patient.lastVisitAt).toEqual(visitDate);
    // The visit itself plus both cache updates - three writes in one transaction.
    expect(manager.save).toHaveBeenCalledTimes(3);
    expect(manager.save).toHaveBeenCalledWith(Clinician, clinician);
    expect(manager.save).toHaveBeenCalledWith(Patient, patient);
  });

  it("leaves lastVisitAt untouched when the new visit is older than the cached value", async () => {
    const newerDate = new Date("2024-06-01");
    const clinician = { id: clinicianId, lastVisitAt: newerDate };
    const patient = { id: patientId, lastVisitAt: newerDate };
    const findOne = vi.fn().mockResolvedValueOnce(clinician).mockResolvedValueOnce(patient);
    const manager = makeManager(findOne);
    useManager(manager);

    const olderVisitDate = new Date("2020-01-01");
    await VisitsService.createVisit({ clinicianId, patientId, visitDate: olderVisitDate });

    expect(clinician.lastVisitAt).toEqual(newerDate);
    expect(patient.lastVisitAt).toEqual(newerDate);
    // Only the visit insert should be written - no redundant cache updates.
    expect(manager.save).toHaveBeenCalledTimes(1);
    expect(manager.save).toHaveBeenCalledWith(Visit, expect.anything());
  });

  it("defaults visitDate to now when none is provided", async () => {
    const clinician = { id: clinicianId, lastVisitAt: null };
    const patient = { id: patientId, lastVisitAt: null };
    const findOne = vi.fn().mockResolvedValueOnce(clinician).mockResolvedValueOnce(patient);
    const manager = makeManager(findOne);
    useManager(manager);

    const before = Date.now();
    const result = await VisitsService.createVisit({ clinicianId, patientId });
    const after = Date.now();

    expect(result.visitDate.getTime()).toBeGreaterThanOrEqual(before);
    expect(result.visitDate.getTime()).toBeLessThanOrEqual(after);
  });

  it("attaches the locked clinician/patient to the returned visit", async () => {
    const clinician = { id: clinicianId, lastVisitAt: null, name: "Dr. Chen" };
    const patient = { id: patientId, lastVisitAt: null, name: "Ada Lovelace" };
    const findOne = vi.fn().mockResolvedValueOnce(clinician).mockResolvedValueOnce(patient);
    const manager = makeManager(findOne);
    useManager(manager);

    const result = await VisitsService.createVisit({ clinicianId, patientId });

    expect(result.clinician).toBe(clinician);
    expect(result.patient).toBe(patient);
  });
});
