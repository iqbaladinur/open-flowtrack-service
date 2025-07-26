import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  Between,
  FindOptionsOrder,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from "typeorm";
import { Transaction } from "../entities/transaction.entity";
import { CreateTransactionDto } from "../dto/create-transaction.dto";
import { UpdateTransactionDto } from "../dto/update-transaction.dto";
import { FindAllTransactionsDto } from "../dto/find-all-transactions.dto";

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
    query?: FindAllTransactionsDto,
  ): Promise<Transaction[]> {
    const where: FindOptionsWhere<Transaction> = { user_id: userId };

    const start = query.start_date ? new Date(query.start_date) : undefined;
    if (start) {
      start.setHours(0, 0, 0, 0);
    }

    const end = query.end_date ? new Date(query.end_date) : undefined;
    if (end) {
      end.setHours(23, 59, 59, 999);
    }

    if (start && end) {
      where.date = Between(start, end);
    } else if (start) {
      where.date = MoreThanOrEqual(start);
    } else if (end) {
      where.date = LessThanOrEqual(end);
    }
    if (query.wallet_id) {
      where.wallet_id = query.wallet_id;
    }
    if (query.category_id) {
      where.category_id = query.category_id;
    }
    if (query.type) {
      where.type = query.type;
    }

    const order: FindOptionsOrder<Transaction> = {
      date: query.sortBy || "DESC",
    };

    return this.transactionsRepository.find({
      where,
      relations: ["category", "wallet"],
      order,
    });
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
