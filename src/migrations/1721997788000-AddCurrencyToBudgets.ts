import { MigrationInterface, QueryRunner, TableColumn, TableUnique } from "typeorm";

export class AddCurrencyToBudgets1721997788000 implements MigrationInterface {
    name = 'AddCurrencyToBudgets1721997788000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add the new currency column
        await queryRunner.addColumn('budgets', new TableColumn({
            name: 'currency',
            type: 'varchar',
            isNullable: false,
            default: "'IDR'", // Default for existing rows
        }));

        // Find and drop the old unique constraint
        const table = await queryRunner.getTable('budgets');
        const oldUniqueConstraint = table.uniques.find(uq => 
            uq.columnNames.includes('user_id') &&
            uq.columnNames.includes('category_id') &&
            uq.columnNames.includes('month') &&
            uq.columnNames.includes('year') &&
            uq.columnNames.length === 4
        );

        if (oldUniqueConstraint) {
            await queryRunner.dropUniqueConstraint('budgets', oldUniqueConstraint);
        }

        // Add the new unique constraint
        await queryRunner.createUniqueConstraint('budgets', new TableUnique({
            name: 'UQ_budget_user_category_month_year_currency',
            columnNames: ['user_id', 'category_id', 'month', 'year', 'currency'],
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the new unique constraint
        await queryRunner.dropUniqueConstraint('budgets', 'UQ_budget_user_category_month_year_currency');

        // Re-create the old unique constraint
        await queryRunner.createUniqueConstraint('budgets', new TableUnique({
            name: 'UQ_budget_user_category_month_year', // A reasonable name for the old constraint
            columnNames: ['user_id', 'category_id', 'month', 'year'],
        }));

        // Drop the currency column
        await queryRunner.dropColumn('budgets', 'currency');
    }
}
