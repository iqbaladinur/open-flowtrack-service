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
import { Wallet } from "../../wallets/entities/wallet.entity";
import { Category } from "../../categories/entities/category.entity";
import { CategoryType } from "../../categories/entities/category.entity";

export enum RecurringPattern {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  YEARLY = "yearly",
}

@Entity("transactions")
export class Transaction {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column({
    type: "enum",
    enum: CategoryType,
  })
  type: CategoryType;

  @Column("decimal", { precision: 15, scale: 2 })
  amount: number;

  @Index()
  @Column()
  wallet_id: string;

  @ManyToOne(() => Wallet)
  @JoinColumn({ name: "wallet_id" })
  wallet: Wallet;

  @Index()
  @Column({ nullable: true })
  category_id: string;

  @ManyToOne(() => Category)
  @JoinColumn({ name: "category_id" })
  category: Category;

  @Index()
  @Column({ nullable: true })
  destination_wallet_id: string;

  @ManyToOne(() => Wallet)
  @JoinColumn({ name: "destination_wallet_id" })
  destinationWallet: Wallet;

  @Index()
  @Column()
  date: Date;

  @Column({ nullable: true })
  note: string;

  @Column({ default: false })
  is_recurring: boolean;

  @Column({
    type: "enum",
    enum: RecurringPattern,
    nullable: true,
  })
  recurring_pattern: RecurringPattern;

  @Index()
  @Column()
  user_id: string;

  @ManyToOne(() => User, (user) => user.transactions)
  @JoinColumn({ name: "user_id" })
  user: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
