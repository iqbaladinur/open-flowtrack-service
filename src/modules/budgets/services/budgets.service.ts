import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  FindManyOptions,
  Repository,
  In,
  MoreThanOrEqual,
  LessThanOrEqual,
} from "typeorm";
import { Budget } from "../entities/budget.entity";
import { CreateBudgetDto } from "../dto/create-budget.dto";
import { UpdateBudgetDto } from "../dto/update-budget.dto";
import { Transaction } from "../../transactions/entities/transaction.entity";
import {
  Category,
  CategoryType,
} from "../../categories/entities/category.entity";
import { FindAllBudgetsDto } from "../dto/find-all-budgets.dto";

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budget)
    private budgetsRepository: Repository<Budget>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async create(createBudgetDto: CreateBudgetDto, userId: string): Promise<any> {
    const budget = this.budgetsRepository.create({
      ...createBudgetDto,
      user_id: userId,
    });
    const savedBudget = await this.budgetsRepository.save(budget);
    return this.findOne(savedBudget.id, userId);
  }

  async findAll(userId: string, query: FindAllBudgetsDto): Promise<any[]> {
    const findOptions: FindManyOptions<Budget> = {
      where: { user_id: userId },
      order: { start_date: "DESC" },
    };

    if (query.start_date) {
      findOptions.where = {
        ...findOptions.where,
        start_date: MoreThanOrEqual(query.start_date),
      };
    }
    if (query.end_date) {
      findOptions.where = {
        ...findOptions.where,
        end_date: LessThanOrEqual(query.end_date),
      };
    }

    const budgets = await this.budgetsRepository.find(findOptions);

    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const totalSpent = await this.calculateSpent(
          userId,
          budget.category_ids,
          budget.start_date,
          budget.end_date,
        );
        const categories = await this.categoriesRepository.find({
          where: { id: In(budget.category_ids) },
        });
        return { ...budget, total_spent: totalSpent, categories };
      }),
    );

    return budgetsWithSpent;
  }

  async findOne(id: string, userId: string): Promise<any> {
    const budget = await this.budgetsRepository.findOne({
      where: { id, user_id: userId },
    });
    if (!budget) {
      throw new NotFoundException(`Budget with ID "${id}" not found`);
    }

    const totalSpent = await this.calculateSpent(
      userId,
      budget.category_ids,
      budget.start_date,
      budget.end_date,
    );

    const categories = await this.categoriesRepository.find({
      where: { id: In(budget.category_ids) },
    });

    return { ...budget, total_spent: totalSpent, categories };
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
    await this.budgetsRepository.save(budget);

    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.budgetsRepository.delete({ id, user_id: userId });
    if (result.affected === 0) {
      throw new NotFoundException(`Budget with ID "${id}" not found`);
    }
  }

  private async calculateSpent(
    userId: string,
    categoryIds: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    if (categoryIds.length === 0) {
      return 0;
    }

    const { total } = await this.transactionsRepository
      .createQueryBuilder("transaction")
      .select("SUM(transaction.amount)", "total")
      .where("transaction.user_id = :userId", { userId })
      .andWhere("transaction.category_id IN (:...categoryIds)", { categoryIds })
      .andWhere("transaction.type = :type", { type: CategoryType.EXPENSE })
      .andWhere("transaction.date BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .getRawOne();

    return parseFloat(total) || 0;
  }
}
