import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./src/app.module";
import * as fs from "fs";
import { User } from "./src/modules/users/entities/user.entity";
import { Budget } from "./src/modules/budgets/entities/budget.entity";
import { Category } from "./src/modules/categories/entities/category.entity";
import { Transaction } from "./src/modules/transactions/entities/transaction.entity";
import { Wallet } from "./src/modules/wallets/entities/wallet.entity";
import { Milestone } from "./src/modules/milestones/entities/milestone.entity";

async function generateSwaggerSpec() {
  console.log("=== Start Swagger Generation ===");

  const app = await NestFactory.create(AppModule, {
    logger: ["log", "error", "warn", "debug"],
  });
  console.log("NestJS AppModule initialized");

  const config = new DocumentBuilder()
    .setTitle("Wallport API")
    .setDescription("API for Personal Finance Tracker Application")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  console.log("Swagger config built");

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [User, Budget, Category, Transaction, Wallet, Milestone],
  });
  console.log("Swagger document created");

  fs.writeFileSync("./swagger.json", JSON.stringify(document, null, 2));
  console.log("Swagger file written to swagger.json");

  await app.close();
  console.log("NestJS application closed");
}

generateSwaggerSpec()
  .then(() => {
    console.log("Swagger spec generated.");
  })
  .catch((e: any) => {
    console.log(e);
  });
