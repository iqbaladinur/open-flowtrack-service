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

export enum Currency {
  IDR = "IDR",
  USD = "USD",
}

@Entity("wallets")
export class Wallet {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({
    type: "enum",
    enum: Currency,
    default: Currency.IDR,
  })
  currency: Currency;

  @Column("decimal", { precision: 15, scale: 2 })
  initial_balance: number;

  @Column()
  @Index()
  user_id: string;

  @ManyToOne(() => User, (user) => user.wallets)
  @JoinColumn({ name: "user_id" })
  user: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
