import { Module } from "@nestjs/common";
import { ConfigService } from "./services/config.service";
import { ConfigController } from "./controllers/config.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Config } from "./entities/config.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Config])],
  providers: [ConfigService],
  controllers: [ConfigController],
  exports: [ConfigService],
})
export class ConfigModule {}
