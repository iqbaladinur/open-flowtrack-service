import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMilestonesTable1763315000000
  implements MigrationInterface
{
  name = "CreateMilestonesTable1763315000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for milestone status
    await queryRunner.query(`
      CREATE TYPE "milestone_status_enum" AS ENUM (
        'pending',
        'in_progress',
        'achieved',
        'failed',
        'cancelled'
      )
    `);

    // Create milestones table
    await queryRunner.query(`
      CREATE TABLE "milestones" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" text,
        "icon" character varying,
        "color" character varying,
        "conditions" jsonb NOT NULL,
        "target_date" TIMESTAMP NOT NULL,
        "achieved_at" TIMESTAMP,
        "status" "milestone_status_enum" NOT NULL DEFAULT 'pending',
        "user_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_milestones" PRIMARY KEY ("id")
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_milestone_user_id" ON "milestones" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_milestone_status" ON "milestones" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_milestone_target_date" ON "milestones" ("target_date")
    `);

    // Add foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "milestones"
      ADD CONSTRAINT "FK_milestone_user"
      FOREIGN KEY ("user_id")
      REFERENCES "users"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "milestones"
      DROP CONSTRAINT "FK_milestone_user"
    `);

    // Drop indexes
    await queryRunner.query(`
      DROP INDEX "IDX_milestone_target_date"
    `);

    await queryRunner.query(`
      DROP INDEX "IDX_milestone_status"
    `);

    await queryRunner.query(`
      DROP INDEX "IDX_milestone_user_id"
    `);

    // Drop table
    await queryRunner.query(`
      DROP TABLE "milestones"
    `);

    // Drop enum type
    await queryRunner.query(`
      DROP TYPE "milestone_status_enum"
    `);
  }
}
