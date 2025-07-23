import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";

@Entity("wallets")
export class Wallet {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  currency: string;

  @Column("decimal", { precision: 10, scale: 2 })
  initial_balance: number;

  @Column()
  user_id: string;

  @ManyToOne(() => User, (user) => user.wallets)
  @JoinColumn({ name: "user_id" })
  user: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
