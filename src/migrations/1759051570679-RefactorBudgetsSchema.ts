import { MigrationInterface, QueryRunner } from "typeorm";

export class RefactorBudgetsSchema1759051570679 implements MigrationInterface {
  name = "RefactorBudgetsSchema1759051570679";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add new columns without NOT NULL constraint
    await queryRunner.query(
      `ALTER TABLE "budgets" ADD "name" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "budgets" ADD "category_ids" uuid array`,
    );
    await queryRunner.query(`ALTER TABLE "budgets" ADD "start_date" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "budgets" ADD "end_date" TIMESTAMP`);

    // 2. Populate new columns with data from old columns
    await queryRunner.query(`
            UPDATE "budgets"
            SET
                "name" = 'Budget ' || "year" || '-' || "month",
                "start_date" = make_date("year", "month", 1),
                "end_date" = make_date("year", "month", 1) + interval '1 month - 1 day',
                "category_ids" = ARRAY[category_id]::uuid[]
        `);

    // 3. Add NOT NULL constraints to new columns
    await queryRunner.query(
      `ALTER TABLE "budgets" ALTER COLUMN "name" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "budgets" ALTER COLUMN "category_ids" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "budgets" ALTER COLUMN "start_date" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "budgets" ALTER COLUMN "end_date" SET NOT NULL`,
    );

    // 4. Drop old unique constraint and columns
    await queryRunner.query(
      `ALTER TABLE "budgets" DROP CONSTRAINT "UQ_eefbd52be54506dd7406720f534"`,
    );
    await queryRunner.query(`ALTER TABLE "budgets" DROP COLUMN "year"`);
    await queryRunner.query(`ALTER TABLE "budgets" DROP COLUMN "month"`);
    await queryRunner.query(`ALTER TABLE "budgets" DROP COLUMN "category_id"`);

    // 5. Add new unique constraint
    await queryRunner.query(
      `ALTER TABLE "budgets" ADD CONSTRAINT "UQ_cda4ce1dc4a2eec9d613f9f9437" UNIQUE ("user_id", "name")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Drop new unique constraint
    await queryRunner.query(
      `ALTER TABLE "budgets" DROP CONSTRAINT "UQ_cda4ce1dc4a2eec9d613f9f9437"`,
    );

    // 2. Add old columns without NOT NULL constraint
    await queryRunner.query(`ALTER TABLE "budgets" ADD "year" integer`);
    await queryRunner.query(`ALTER TABLE "budgets" ADD "month" integer`);
    await queryRunner.query(`ALTER TABLE "budgets" ADD "category_id" uuid`);

    // 3. Populate old columns with data from new columns
    await queryRunner.query(`
            UPDATE "budgets"
            SET
                "year" = EXTRACT(YEAR FROM "start_date"),
                "month" = EXTRACT(MONTH FROM "start_date"),
                "category_id" = "category_ids"[1]
        `);

    // 4. Add NOT NULL constraints to old columns
    await queryRunner.query(
      `ALTER TABLE "budgets" ALTER COLUMN "year" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "budgets" ALTER COLUMN "month" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "budgets" ALTER COLUMN "category_id" SET NOT NULL`,
    );

    // 5. Drop new columns
    await queryRunner.query(`ALTER TABLE "budgets" DROP COLUMN "end_date"`);
    await queryRunner.query(`ALTER TABLE "budgets" DROP COLUMN "start_date"`);
    await queryRunner.query(`ALTER TABLE "budgets" DROP COLUMN "category_ids"`);
    await queryRunner.query(`ALTER TABLE "budgets" DROP COLUMN "name"`);

    // 6. Add old unique constraint
    await queryRunner.query(
      `ALTER TABLE "budgets" ADD CONSTRAINT "UQ_eefbd52be54506dd7406720f534" UNIQUE ("user_id", "year", "month", "category_id")`,
    );
  }
}
