import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());
  app.enableCors();
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    }),
  );

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle("Wallport API")
    .setDescription("API for Personal Finance Tracker Application")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
