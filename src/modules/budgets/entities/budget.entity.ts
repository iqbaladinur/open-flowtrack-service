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
import { Category } from "../../categories/entities/category.entity";
import { Currency } from "../../wallets/entities/currency.enum";

@Entity("budgets")
@Unique(["user_id", "category_id", "month", "year", "currency"])
export class Budget {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  category_id: string;

  @ManyToOne(() => Category)
  @JoinColumn({ name: "category_id" })
  category: Category;

  @Column("decimal", { precision: 10, scale: 2 })
  limit_amount: number;

  @Column()
  month: number;

  @Column()
  year: number;

  @Column({
    type: "enum",
    enum: Currency,
    default: Currency.IDR,
  })
  currency: Currency;

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
