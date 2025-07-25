import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./src/app.module";
import * as fs from "fs";

async function generateSwaggerSpec() {
  const app = await NestFactory.create(AppModule, { logger: false });

  const config = new DocumentBuilder()
    .setTitle("Wallport API")
    .setDescription("API for Personal Finance Tracker Application")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);

  fs.writeFileSync("./swagger.json", JSON.stringify(document, null, 2));
  await app.close();
}

generateSwaggerSpec().then(() => {
  console.log("Swagger spec generated.");
});
