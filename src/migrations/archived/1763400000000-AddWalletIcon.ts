import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWalletIcon1763400000000 implements MigrationInterface {
  name = "AddWalletIcon1763400000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "wallets"
      ADD COLUMN "icon" character varying DEFAULT '' NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "wallets"
      DROP COLUMN "icon"
    `);
  }
}
