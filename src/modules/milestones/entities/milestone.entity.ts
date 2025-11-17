import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "../../users/entities/user.entity";

export enum MilestoneStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  ACHIEVED = "achieved",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

@Entity("milestones")
export class Milestone {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column("text", { nullable: true })
  description: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ nullable: true })
  color: string;

  @Column("jsonb")
  conditions: any[];

  @Column("timestamp")
  @Index()
  target_date: Date;

  @Column("timestamp", { nullable: true })
  achieved_at: Date;

  @Column({
    type: "enum",
    enum: MilestoneStatus,
    default: MilestoneStatus.PENDING,
  })
  @Index()
  status: MilestoneStatus;

  @Column()
  @Index()
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
