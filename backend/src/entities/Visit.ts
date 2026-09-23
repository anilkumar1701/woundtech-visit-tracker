import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Clinician } from "./Clinician";
import { Patient } from "./Patient";

@Entity({ name: "visits" })
@Index(["clinician", "visitDate"])
@Index(["patient", "visitDate"])
export class Visit {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Clinician, (clinician) => clinician.visits, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "clinician_id" })
  clinician!: Clinician;

  @Column({ name: "clinician_id" })
  clinicianId!: string;

  @ManyToOne(() => Patient, (patient) => patient.visits, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "patient_id" })
  patient!: Patient;

  @Column({ name: "patient_id" })
  patientId!: string;

  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  visitDate!: Date;

  @Column({ type: "text", nullable: true })
  notes!: string | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
