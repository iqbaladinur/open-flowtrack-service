import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Budget } from "../entities/budget.entity";
import { CreateBudgetDto } from "../dto/create-budget.dto";
import { UpdateBudgetDto } from "../dto/update-budget.dto";
import { Transaction } from "../../transactions/entities/transaction.entity";
import { CategoryType } from "../../categories/entities/category.entity";
import { Currency } from "../../wallets/entities/currency.enum";

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budget)
    private budgetsRepository: Repository<Budget>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  async create(
    createBudgetDto: CreateBudgetDto,
    userId: string,
  ): Promise<Budget> {
    const budget = this.budgetsRepository.create({
      ...createBudgetDto,
      user_id: userId,
    });
    return this.budgetsRepository.save(budget);
  }

  async findAll(userId: string): Promise<any[]> {
    const budgets = await this.budgetsRepository.find({
      where: { user_id: userId },
      relations: ["category"],
    });

    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const totalSpent = await this.calculateSpent(
          userId,
          budget.category_id,
          budget.year,
          budget.month,
          budget.currency,
        );
        return { ...budget, total_spent: totalSpent };
      }),
    );

    return budgetsWithSpent;
  }

  async findOne(id: string, userId: string): Promise<any> {
    const budget = await this.budgetsRepository.findOne({
      where: { id, user_id: userId },
      relations: ["category"],
    });
    if (!budget) {
      throw new NotFoundException(`Budget with ID "${id}" not found`);
    }

    const totalSpent = await this.calculateSpent(
      userId,
      budget.category_id,
      budget.year,
      budget.month,
      budget.currency,
    );

    return { ...budget, total_spent: totalSpent };
  }

  async update(
    id: string,
    updateBudgetDto: UpdateBudgetDto,
    userId: string,
  ): Promise<any> {
    const budget = await this.budgetsRepository.findOne({
      where: { id, user_id: userId },
    });
    if (!budget) {
      throw new NotFoundException(`Budget with ID "${id}" not found`);
    }

    Object.assign(budget, updateBudgetDto);
    const updatedBudget = await this.budgetsRepository.save(budget);

    const totalSpent = await this.calculateSpent(
      userId,
      updatedBudget.category_id,
      updatedBudget.year,
      updatedBudget.month,
      updatedBudget.currency,
    );

    return { ...updatedBudget, total_spent: totalSpent };
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.budgetsRepository.delete({ id, user_id: userId });
    if (result.affected === 0) {
      throw new NotFoundException(`Budget with ID "${id}" not found`);
    }
  }

  private async calculateSpent(
    userId: string,
    categoryId: string,
    year: number,
    month: number,
    currency: Currency,
  ): Promise<number> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const { total } = await this.transactionsRepository
      .createQueryBuilder("transaction")
      .leftJoin("transaction.wallet", "wallet")
      .select("SUM(transaction.amount)", "total")
      .where("transaction.user_id = :userId", { userId })
      .andWhere("transaction.category_id = :categoryId", { categoryId })
      .andWhere("transaction.type = :type", { type: CategoryType.EXPENSE })
      .andWhere("wallet.currency = :currency", { currency })
      .andWhere("transaction.date BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .getRawOne();

    return parseFloat(total) || 0;
  }
}
