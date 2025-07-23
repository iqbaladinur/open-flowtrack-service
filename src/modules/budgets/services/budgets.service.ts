import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Budget } from "../entities/budget.entity";
import { CreateBudgetDto } from "../dto/create-budget.dto";
import { UpdateBudgetDto } from "../dto/update-budget.dto";

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budget)
    private budgetsRepository: Repository<Budget>,
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

  async findAll(userId: string): Promise<Budget[]> {
    return this.budgetsRepository.find({ where: { user_id: userId } });
  }

  async findOne(id: string, userId: string): Promise<Budget> {
    const budget = await this.budgetsRepository.findOne({
      where: { id, user_id: userId },
    });
    if (!budget) {
      throw new NotFoundException(`Budget with ID "${id}" not found`);
    }
    return budget;
  }

  async update(
    id: string,
    updateBudgetDto: UpdateBudgetDto,
    userId: string,
  ): Promise<Budget> {
    const budget = await this.findOne(id, userId);
    Object.assign(budget, updateBudgetDto);
    return this.budgetsRepository.save(budget);
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.budgetsRepository.delete({ id, user_id: userId });
    if (result.affected === 0) {
      throw new NotFoundException(`Budget with ID "${id}" not found`);
    }
  }
}
