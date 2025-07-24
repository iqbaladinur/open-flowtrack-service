import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, FindOptionsWhere, Repository } from "typeorm";
import { Transaction } from "../entities/transaction.entity";
import { CreateTransactionDto } from "../dto/create-transaction.dto";
import { UpdateTransactionDto } from "../dto/update-transaction.dto";
import { CategoryType } from "../../categories/entities/category.entity";

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto,
    userId: string,
  ): Promise<Transaction> {
    const transaction = this.transactionsRepository.create({
      ...createTransactionDto,
      user_id: userId,
    });
    return this.transactionsRepository.save(transaction);
  }

  async findAll(
    userId: string,
    startDate?: Date,
    endDate?: Date,
    walletId?: string,
    categoryId?: string,
    type?: CategoryType,
  ): Promise<Transaction[]> {
    const where: FindOptionsWhere<Transaction> = { user_id: userId };

    if (startDate && endDate) {
      where.date = Between(startDate, endDate);
    }
    if (walletId) {
      where.wallet_id = walletId;
    }
    if (categoryId) {
      where.category_id = categoryId;
    }
    if (type) {
      where.type = type;
    }

    return this.transactionsRepository.find({ where });
  }

  async findOne(id: string, userId: string): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id, user_id: userId },
    });
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID "${id}" not found`);
    }
    return transaction;
  }

  async update(
    id: string,
    updateTransactionDto: UpdateTransactionDto,
    userId: string,
  ): Promise<Transaction> {
    const transaction = await this.findOne(id, userId);
    Object.assign(transaction, updateTransactionDto);
    return this.transactionsRepository.save(transaction);
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.transactionsRepository.delete({
      id,
      user_id: userId,
    });
    if (result.affected === 0) {
      throw new NotFoundException(`Transaction with ID "${id}" not found`);
    }
  }
}
