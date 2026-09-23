import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Visit } from "./Visit";

@Entity({ name: "patients" })
export class Patient {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "varchar", length: 150 })
  name!: string;

  @Column({ type: "date", nullable: true })
  dateOfBirth!: string | null;

  @Column({ type: "timestamptz", nullable: true })
  lastVisitAt!: Date | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @OneToMany(() => Visit, (visit) => visit.patient)
  visits!: Visit[];
}
