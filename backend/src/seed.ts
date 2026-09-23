import "reflect-metadata";
import { AppDataSource } from "./config/data-source";
import { Clinician } from "./entities/Clinician";
import { Patient } from "./entities/Patient";
import { VisitsService } from "./services/visits.service";

async function seed() {
  await AppDataSource.initialize();

  const clinicianRepo = AppDataSource.getRepository(Clinician);
  const patientRepo = AppDataSource.getRepository(Patient);

  const existing = await clinicianRepo.count();
  if (existing > 0) {
    console.log("Database already has clinicians - skipping seed.");
    await AppDataSource.destroy();
    return;
  }

  const clinicians = await clinicianRepo.save([
    clinicianRepo.create({ name: "Dr. Maria Chen", specialty: "Wound Care" }),
    clinicianRepo.create({ name: "Dr. James Okafor", specialty: "Podiatry" }),
    clinicianRepo.create({
      name: "Dr. Priya Nair",
      specialty: "Internal Medicine",
    }),
  ]);

  const patients = await patientRepo.save([
    patientRepo.create({ name: "Alan Turing", dateOfBirth: "1954-06-07" }),
    patientRepo.create({ name: "Grace Hopper", dateOfBirth: "1948-12-09" }),
    patientRepo.create({ name: "Ada Lovelace", dateOfBirth: "1972-03-14" }),
    patientRepo.create({ name: "Katherine Johnson", dateOfBirth: "1961-08-26" }),
  ]);

  const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

  await VisitsService.createVisit({
    clinicianId: clinicians[0].id,
    patientId: patients[0].id,
    visitDate: daysAgo(1),
    notes: "Dressing changed, wound healing well, reduced redness.",
  });
  await VisitsService.createVisit({
    clinicianId: clinicians[0].id,
    patientId: patients[1].id,
    visitDate: daysAgo(2),
    notes: "Follow-up on post-op incision. No signs of infection.",
  });
  await VisitsService.createVisit({
    clinicianId: clinicians[1].id,
    patientId: patients[2].id,
    visitDate: daysAgo(4),
    notes: "Diabetic foot ulcer assessment, debridement performed.",
  });
  await VisitsService.createVisit({
    clinicianId: clinicians[2].id,
    patientId: patients[3].id,
    visitDate: daysAgo(7),
  });
  await VisitsService.createVisit({
    clinicianId: clinicians[1].id,
    patientId: patients[0].id,
    visitDate: daysAgo(10),
    notes: "Routine check-in, patient reports no pain.",
  });

  console.log(
    `Seeded ${clinicians.length} clinicians, ${patients.length} patients, 5 visits.`
  );
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
