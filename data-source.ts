import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables from .env file
config();

// This configuration is specifically for TypeORM CLI
// It reads the DATABASE_URL environment variable, as it runs outside the NestJS context.
export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false, // Never use TRUE in production
  logging: process.env.NODE_ENV === 'development',
  entities: [join(__dirname, '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'src/migrations', '*.{ts,js}')],
  migrationsTableName: 'migrations',
} as DataSourceOptions);
