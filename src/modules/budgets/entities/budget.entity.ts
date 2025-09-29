import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";
import { User } from "../../users/entities/user.entity";

@Entity("budgets")
@Unique(["user_id", "name"])
export class Budget {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column("uuid", { array: true })
  category_ids: string[];

  @Column("decimal", { precision: 10, scale: 2 })
  limit_amount: number;

  @Column()
  start_date: Date;

  @Column()
  end_date: Date;

  @Column()
  user_id: string;

  @ManyToOne(() => User, (user) => user.budgets)
  @JoinColumn({ name: "user_id" })
  user: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
