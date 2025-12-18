import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveRecurringFields1734479000000
  implements MigrationInterface
{
  name = "RemoveRecurringFields1734479000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop is_recurring column
    await queryRunner.query(`
      ALTER TABLE "transactions"
      DROP COLUMN IF EXISTS "is_recurring"
    `);

    // Drop recurring_pattern column
    await queryRunner.query(`
      ALTER TABLE "transactions"
      DROP COLUMN IF EXISTS "recurring_pattern"
    `);

    // Drop recurring_pattern enum type if it exists
    await queryRunner.query(`
      DROP TYPE IF EXISTS "transactions_recurring_pattern_enum"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate enum type
    await queryRunner.query(`
      CREATE TYPE "transactions_recurring_pattern_enum" AS ENUM (
        'daily',
        'weekly',
        'monthly',
        'yearly'
      )
    `);

    // Recreate recurring_pattern column
    await queryRunner.query(`
      ALTER TABLE "transactions"
      ADD "recurring_pattern" "transactions_recurring_pattern_enum"
    `);

    // Recreate is_recurring column
    await queryRunner.query(`
      ALTER TABLE "transactions"
      ADD "is_recurring" boolean NOT NULL DEFAULT false
    `);
  }
}
