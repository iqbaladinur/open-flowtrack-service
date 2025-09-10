import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Wallet } from "../../wallets/entities/wallet.entity";
import { Category } from "../../categories/entities/category.entity";
import { Transaction } from "../../transactions/entities/transaction.entity";
import { Budget } from "../../budgets/entities/budget.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password_hash: string;

  @Column({ nullable: true })
  full_name: string;

  @Column({ nullable: true })
  provider: string;

  @Column({ nullable: true })
  password_reset_token: string;

  @Column({ nullable: true })
  password_reset_expires: Date;

  @Column({ nullable: true })
  refresh_token: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Wallet, (wallet) => wallet.user)
  wallets: Wallet[];

  @OneToMany(() => Category, (category) => category.user)
  categories: Category[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @OneToMany(() => Budget, (budget) => budget.user)
  budgets: Budget[];
}
