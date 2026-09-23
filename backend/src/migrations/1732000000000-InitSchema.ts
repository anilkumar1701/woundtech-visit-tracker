import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1732000000000 implements MigrationInterface {
  name = "InitSchema1732000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      CREATE TABLE "clinicians" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar(150) NOT NULL,
        "specialty" varchar(150),
        "lastVisitAt" timestamptz,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_clinicians_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_clinicians_name" ON "clinicians" ("name")`
    );

    await queryRunner.query(`
      CREATE TABLE "patients" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar(150) NOT NULL,
        "dateOfBirth" date,
        "lastVisitAt" timestamptz,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_patients_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_patients_name" ON "patients" ("name")`
    );

    await queryRunner.query(`
      CREATE TABLE "visits" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "clinician_id" uuid NOT NULL,
        "patient_id" uuid NOT NULL,
        "visitDate" timestamptz NOT NULL DEFAULT now(),
        "notes" text,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_visits_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_visits_clinician" FOREIGN KEY ("clinician_id")
          REFERENCES "clinicians"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "FK_visits_patient" FOREIGN KEY ("patient_id")
          REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);

    // Supports "list visits, most recent first" and the per-clinician /
    // per-patient filtered variants of the same query.
    await queryRunner.query(
      `CREATE INDEX "IDX_visits_clinician_date" ON "visits" ("clinician_id", "visitDate" DESC)`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_visits_patient_date" ON "visits" ("patient_id", "visitDate" DESC)`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_visits_date" ON "visits" ("visitDate" DESC)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "visits"`);
    await queryRunner.query(`DROP TABLE "patients"`);
    await queryRunner.query(`DROP TABLE "clinicians"`);
  }
}
