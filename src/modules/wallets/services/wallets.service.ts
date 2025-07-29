import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Wallet } from "../entities/wallet.entity";
import { CreateWalletDto } from "../dto/create-wallet.dto";
import { UpdateWalletDto } from "../dto/update-wallet.dto";
import { Transaction } from "../../transactions/entities/transaction.entity";
import { CategoryType } from "../../categories/entities/category.entity";

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private walletsRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async create(
    createWalletDto: CreateWalletDto,
    userId: string,
  ): Promise<Wallet> {
    const wallet = this.walletsRepository.create({
      ...createWalletDto,
      user_id: userId,
    });
    return this.walletsRepository.save(wallet);
  }

  async findAll(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<(Wallet & { current_balance: number })[]> {
    const wallets = await this.walletsRepository.find({
      where: { user_id: userId },
    });

    const walletIds = wallets.map((wallet) => wallet.id);
    if (walletIds.length === 0) {
      return [];
    }

    const transactionQuery = this.transactionRepository
      .createQueryBuilder("transaction")
      .select("transaction.wallet_id", "wallet_id")
      .addSelect("transaction.type", "type")
      .addSelect("SUM(transaction.amount)", "total")
      .where("transaction.wallet_id IN (:...walletIds)", { walletIds })
      .groupBy("transaction.wallet_id, transaction.type");

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      transactionQuery.andWhere("transaction.date >= :startDate", {
        startDate: start,
      });
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      transactionQuery.andWhere("transaction.date <= :endDate", {
        endDate: end,
      });
    }

    const transactionSums = await transactionQuery.getRawMany();

    const transactionMap = new Map<
      string,
      { income: number; expense: number }
    >();

    for (const sum of transactionSums) {
      if (!transactionMap.has(sum.wallet_id)) {
        transactionMap.set(sum.wallet_id, { income: 0, expense: 0 });
      }
      const totals = transactionMap.get(sum.wallet_id);
      if (sum.type === CategoryType.INCOME) {
        totals.income = parseFloat(sum.total);
      } else if (sum.type === CategoryType.EXPENSE) {
        totals.expense = parseFloat(sum.total);
      }
    }

    const walletsWithBalance = wallets.map((wallet) => {
      const totals = transactionMap.get(wallet.id) || {
        income: 0,
        expense: 0,
      };
      const balance =
        Number(wallet.initial_balance) + totals.income - totals.expense;
      return {
        ...wallet,
        current_balance: balance,
      };
    });

    return walletsWithBalance;
  }

  async findOne(id: string, userId: string): Promise<Wallet> {
    const wallet = await this.walletsRepository.findOne({
      where: { id, user_id: userId },
    });
    if (!wallet) {
      throw new NotFoundException(`Wallet with ID "${id}" not found`);
    }
    return wallet;
  }

  async update(
    id: string,
    updateWalletDto: UpdateWalletDto,
    userId: string,
  ): Promise<Wallet> {
    const wallet = await this.findOne(id, userId);
    Object.assign(wallet, updateWalletDto);
    return this.walletsRepository.save(wallet);
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.walletsRepository.delete({ id, user_id: userId });
    if (result.affected === 0) {
      throw new NotFoundException(`Wallet with ID "${id}" not found`);
    }
  }
}
