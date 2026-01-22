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

@Entity("wallets")
@Index("user_main_wallet_unique", ["user_id"], {
  where: `"is_main_wallet" = true`,
  unique: true,
})
export class Wallet {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ default: "", nullable: true })
  icon: string;

  @Column("decimal", { precision: 18, scale: 4 })
  initial_balance: number;

  @Column({ default: false })
  hidden: boolean;

  @Column({ default: false })
  is_main_wallet: boolean;

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
