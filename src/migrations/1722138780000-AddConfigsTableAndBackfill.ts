import { MigrationInterface, QueryRunner } from "typeorm";

export class AddConfigsTableAndBackfill1722138780000
  implements MigrationInterface
{
  name = "AddConfigsTableAndBackfill1722138780000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable("configs");

    if (!tableExists) {
      await queryRunner.query(`
                CREATE TABLE "configs" (
                    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                    "currency" character varying NOT NULL DEFAULT 'IDR',
                    "fractions" integer NOT NULL DEFAULT 2,
                    "user_id" uuid NOT NULL,
                    CONSTRAINT "REL_user_id" UNIQUE ("user_id"),
                    CONSTRAINT "PK_configs_id" PRIMARY KEY ("id")
                )
            `);

      await queryRunner.query(`
                ALTER TABLE "configs"
                ADD CONSTRAINT "FK_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
            `);
    }

    const usersWithoutConfig = await queryRunner.query(`
            SELECT u.id FROM "users" u
            LEFT JOIN "configs" c ON u.id = c.user_id
            WHERE c.id IS NULL
        `);

    for (const user of usersWithoutConfig) {
      await queryRunner.query(`INSERT INTO "configs" ("user_id") VALUES ($1)`, [
        user.id,
      ]);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable("configs");
    if (tableExists) {
      await queryRunner.query(`
                ALTER TABLE "configs" DROP CONSTRAINT "FK_user_id"
            `);
      await queryRunner.query(`
                DROP TABLE "configs"
            `);
    }
  }
}
