import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDecimalPrecision1762813552666
  implements MigrationInterface
{
  name = "UpdateDecimalPrecision1762813552666";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update transactions.amount from DECIMAL(15,2) to DECIMAL(18,4)
    await queryRunner.query(
      `ALTER TABLE "transactions" ALTER COLUMN "amount" TYPE DECIMAL(18, 4)`,
    );

    // Update wallets.initial_balance from DECIMAL(15,2) to DECIMAL(18,4)
    await queryRunner.query(
      `ALTER TABLE "wallets" ALTER COLUMN "initial_balance" TYPE DECIMAL(18, 4)`,
    );

    // Update budgets.limit_amount from DECIMAL(10,2) to DECIMAL(18,4)
    await queryRunner.query(
      `ALTER TABLE "budgets" ALTER COLUMN "limit_amount" TYPE DECIMAL(18, 4)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert budgets.limit_amount from DECIMAL(18,4) to DECIMAL(10,2)
    // WARNING: This may cause data loss if values exceed DECIMAL(10,2) range
    await queryRunner.query(
      `ALTER TABLE "budgets" ALTER COLUMN "limit_amount" TYPE DECIMAL(10, 2)`,
    );

    // Revert wallets.initial_balance from DECIMAL(18,4) to DECIMAL(15,2)
    // WARNING: This will truncate decimal places from 4 to 2
    await queryRunner.query(
      `ALTER TABLE "wallets" ALTER COLUMN "initial_balance" TYPE DECIMAL(15, 2)`,
    );

    // Revert transactions.amount from DECIMAL(18,4) to DECIMAL(15,2)
    // WARNING: This will truncate decimal places from 4 to 2
    await queryRunner.query(
      `ALTER TABLE "transactions" ALTER COLUMN "amount" TYPE DECIMAL(15, 2)`,
    );
  }
}
