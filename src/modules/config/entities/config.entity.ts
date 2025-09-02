import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "../../users/entities/user.entity";

@Entity("configs")
export class Config {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ default: "IDR" })
  currency: string;

  @Column({ default: 2 })
  fractions: number;

  @Column({ nullable: true })
  gemini_api_key: string;

  @Column()
  @Index({ unique: true })
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;
}
