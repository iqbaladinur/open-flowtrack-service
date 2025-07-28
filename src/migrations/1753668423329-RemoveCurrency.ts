import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveCurrency1753668423329 implements MigrationInterface {
  name = "RemoveCurrency1753668423329";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."categories_type_enum" AS ENUM('income', 'expense')`,
    );
    await queryRunner.query(
      `CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "type" "public"."categories_type_enum" NOT NULL, "icon" character varying NOT NULL, "color" character varying NOT NULL, "user_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."transactions_type_enum" AS ENUM('income', 'expense')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."transactions_recurring_pattern_enum" AS ENUM('daily', 'weekly', 'monthly', 'yearly')`,
    );
    await queryRunner.query(
      `CREATE TABLE "transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."transactions_type_enum" NOT NULL, "amount" numeric(15,2) NOT NULL, "wallet_id" uuid NOT NULL, "category_id" uuid NOT NULL, "date" TIMESTAMP NOT NULL, "note" character varying, "is_recurring" boolean NOT NULL DEFAULT false, "recurring_pattern" "public"."transactions_recurring_pattern_enum", "user_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2d5fa024a84dceb158b2b95f34" ON "transactions" ("type") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0b171330be0cb621f8d73b87a9" ON "transactions" ("wallet_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c9e41213ca42d50132ed7ab2b0" ON "transactions" ("category_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d66471a99dd3836e1528d39a1e" ON "transactions" ("date") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e9acc6efa76de013e8c1553ed2" ON "transactions" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "budgets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "category_id" uuid NOT NULL, "limit_amount" numeric(10,2) NOT NULL, "month" integer NOT NULL, "year" integer NOT NULL, "user_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_eefbd52be54506dd7406720f534" UNIQUE ("user_id", "category_id", "month", "year"), CONSTRAINT "PK_9c8a51748f82387644b773da482" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password_hash" character varying, "full_name" character varying, "provider" character varying, "password_reset_token" character varying, "password_reset_expires" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "wallets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "initial_balance" numeric(15,2) NOT NULL, "user_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8402e5df5a30a229380e83e4f7e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_92558c08091598f7a4439586cd" ON "wallets" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."wallets_currency_enum" AS ENUM('IDR', 'USD')`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" ADD "currency" "public"."wallets_currency_enum" NOT NULL DEFAULT 'IDR'`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "FK_2296b7fe012d95646fa41921c8b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_0b171330be0cb621f8d73b87a9e" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_c9e41213ca42d50132ed7ab2b0f" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_e9acc6efa76de013e8c1553ed2b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "budgets" ADD CONSTRAINT "FK_4bb589bf6db49e8c1fd6af05f49" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "budgets" ADD CONSTRAINT "FK_5d25d8bbd6c209261dfe04558f1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" ADD CONSTRAINT "FK_92558c08091598f7a4439586cda" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "wallets" DROP CONSTRAINT "FK_92558c08091598f7a4439586cda"`,
    );
    await queryRunner.query(
      `ALTER TABLE "budgets" DROP CONSTRAINT "FK_5d25d8bbd6c209261dfe04558f1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "budgets" DROP CONSTRAINT "FK_4bb589bf6db49e8c1fd6af05f49"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_e9acc6efa76de013e8c1553ed2b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_c9e41213ca42d50132ed7ab2b0f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_0b171330be0cb621f8d73b87a9e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "FK_2296b7fe012d95646fa41921c8b"`,
    );
    await queryRunner.query(`ALTER TABLE "wallets" DROP COLUMN "currency"`);
    await queryRunner.query(`DROP TYPE "public"."wallets_currency_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_92558c08091598f7a4439586cd"`,
    );
    await queryRunner.query(`DROP TABLE "wallets"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "budgets"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e9acc6efa76de013e8c1553ed2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d66471a99dd3836e1528d39a1e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c9e41213ca42d50132ed7ab2b0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0b171330be0cb621f8d73b87a9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2d5fa024a84dceb158b2b95f34"`,
    );
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(
      `DROP TYPE "public"."transactions_recurring_pattern_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."transactions_type_enum"`);
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(`DROP TYPE "public"."categories_type_enum"`);
  }
}
