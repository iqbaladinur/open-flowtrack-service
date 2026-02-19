import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { WalletsModule } from "./modules/wallets/wallets.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { TransactionsModule } from "./modules/transactions/transactions.module";
import { BudgetsModule } from "./modules/budgets/budgets.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { ExportModule } from "./modules/export/export.module";
import { BackupModule } from "./modules/backup/backup.module";
import configuration from "./infrastructure/config/configuration";
import { validationSchema } from "./infrastructure/config/validation";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
import { MilestonesModule } from "./modules/milestones/milestones.module";
import { McpModule } from "./modules/mcp/mcp.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      envFilePath: ".env",
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        url: configService.get<string>("database.url"),
        entities: [__dirname + "/**/*.entity{.ts,.js}"],
        synchronize: true, // Should be false in production
        autoLoadEntities: true,
      }),
    }),
    AuthModule,
    UsersModule,
    WalletsModule,
    CategoriesModule,
    TransactionsModule,
    BudgetsModule,
    ReportsModule,
    ExportModule,
    BackupModule,
    AnalyticsModule,
    MilestonesModule,
    McpModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
