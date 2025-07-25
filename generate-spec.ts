import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./src/app.module";
import * as fs from "fs";
import { User } from "./src/modules/users/entities/user.entity";
import { Budget } from "./src/modules/budgets/entities/budget.entity";
import { Category } from "./src/modules/categories/entities/category.entity";
import { Transaction } from "./src/modules/transactions/entities/transaction.entity";
import { Wallet } from "./src/modules/wallets/entities/wallet.entity";

async function generateSwaggerSpec() {
  const app = await NestFactory.create(AppModule, { logger: false });

  const config = new DocumentBuilder()
    .setTitle("Wallport API")
    .setDescription("API for Personal Finance Tracker Application")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [User, Budget, Category, Transaction, Wallet],
  });

  fs.writeFileSync("./swagger.json", JSON.stringify(document, null, 2));
  await app.close();
}

generateSwaggerSpec().then(() => {
  console.log("Swagger spec generated.");
});
