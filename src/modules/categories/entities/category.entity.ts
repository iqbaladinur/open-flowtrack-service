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

export enum CategoryType {
  INCOME = "income",
  EXPENSE = "expense",
}

@Entity("categories")
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({
    type: "enum",
    enum: CategoryType,
  })
  type: CategoryType;

  @Column()
  icon: string;

  @Column()
  color: string;

  @Column({ nullable: true })
  user_id: string;

  @ManyToOne(() => User, (user) => user.categories)
  @JoinColumn({ name: "user_id" })
  user: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
