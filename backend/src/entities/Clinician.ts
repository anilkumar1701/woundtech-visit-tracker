import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Visit } from "./Visit";

@Entity({ name: "clinicians" })
export class Clinician {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "varchar", length: 150 })
  name!: string;

  @Column({ type: "varchar", length: 150, nullable: true })
  specialty!: string | null;

  @Column({ type: "timestamptz", nullable: true })
  lastVisitAt!: Date | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @OneToMany(() => Visit, (visit) => visit.clinician)
  visits!: Visit[];
}
