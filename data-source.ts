import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';
import { SeederOptions, runSeeders } from 'typeorm-extension';
import TransactionSeeder from './src/seeds/transaction.seeder';

// Load environment variables from .env file
config();

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false, // Never use TRUE in production
  logging: process.env.NODE_ENV === 'development',
  entities: [join(__dirname, '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'src/migrations', '*.{ts,js}')],
  migrationsTableName: 'migrations',
  seeds: [TransactionSeeder],
};

export const AppDataSource = new DataSource(options);

AppDataSource.initialize().then(async () => {
  if (process.argv.includes('seed')) {
    await runSeeders(AppDataSource);
    console.log('Seeding complete!');
    process.exit();
  }
});
