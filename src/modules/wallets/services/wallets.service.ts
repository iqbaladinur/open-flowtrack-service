import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Not } from "typeorm";
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
    return this.walletsRepository.manager.transaction(
      async (transactionalEntityManager) => {
        if (createWalletDto.is_main_wallet) {
          await transactionalEntityManager.update(
            Wallet,
            { user_id: userId },
            { is_main_wallet: false },
          );
        }
        const wallet = transactionalEntityManager.create(Wallet, {
          ...createWalletDto,
          user_id: userId,
        });
        return transactionalEntityManager.save(wallet);
      },
    );
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

    const changesMap = new Map<string, number>();

    // 1. Outgoing transactions (expense, transfer) and income
    const sourceTransactionsQb = this.transactionRepository
      .createQueryBuilder("transaction")
      .select("transaction.wallet_id", "wallet_id")
      .addSelect(
        "SUM(CASE WHEN transaction.type = :income THEN transaction.amount ELSE -transaction.amount END)",
        "change",
      )
      .where("transaction.wallet_id IN (:...walletIds)", { walletIds })
      .setParameters({ income: CategoryType.INCOME })
      .groupBy("transaction.wallet_id");

    // 2. Incoming transfers
    const destinationTransfersQb = this.transactionRepository
      .createQueryBuilder("transaction")
      .select("transaction.destination_wallet_id", "wallet_id")
      .addSelect("SUM(transaction.amount)", "change")
      .where("transaction.destination_wallet_id IN (:...walletIds)", {
        walletIds,
      })
      .andWhere("transaction.type = :transfer", {
        transfer: CategoryType.TRANSFER,
      })
      .groupBy("transaction.destination_wallet_id");

    if (startDate) {
      const start = new Date(startDate);
      sourceTransactionsQb.andWhere("transaction.date >= :startDate", {
        startDate: start,
      });
      destinationTransfersQb.andWhere("transaction.date >= :startDate", {
        startDate: start,
      });
    }
    if (endDate) {
      const end = new Date(endDate);
      sourceTransactionsQb.andWhere("transaction.date <= :endDate", {
        endDate: end,
      });
      destinationTransfersQb.andWhere("transaction.date <= :endDate", {
        endDate: end,
      });
    }

    const sourceChanges = await sourceTransactionsQb.getRawMany();
    const destinationChanges = await destinationTransfersQb.getRawMany();

    sourceChanges.forEach((c) =>
      changesMap.set(c.wallet_id, parseFloat(c.change)),
    );

    destinationChanges.forEach((c) => {
      const existingChange = changesMap.get(c.wallet_id) || 0;
      changesMap.set(c.wallet_id, existingChange + parseFloat(c.change));
    });

    const walletsWithBalance = wallets.map((wallet) => {
      const change = changesMap.get(wallet.id) || 0;
      const balance = Number(wallet.initial_balance) + change;
      return {
        ...wallet,
        current_balance: balance,
      };
    });

    return walletsWithBalance;
  }

  async findOne(
    id: string,
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Wallet & { current_balance: number }> {
    const wallet = await this.walletsRepository.findOne({
      where: { id, user_id: userId },
    });
    if (!wallet) {
      throw new NotFoundException(`Wallet with ID "${id}" not found`);
    }

    const qb = this.transactionRepository
      .createQueryBuilder("transaction")
      .select(
        `SUM(
        CASE
          WHEN transaction.wallet_id = :walletId AND transaction.type = :income THEN transaction.amount
          WHEN transaction.wallet_id = :walletId AND transaction.type = :expense THEN -transaction.amount
          WHEN transaction.wallet_id = :walletId AND transaction.type = :transfer THEN -transaction.amount
          WHEN transaction.destination_wallet_id = :walletId AND transaction.type = :transfer THEN transaction.amount
          ELSE 0
        END
      )`,
        "change",
      )
      .where("transaction.user_id = :userId", { userId })
      .andWhere(
        "(transaction.wallet_id = :walletId OR transaction.destination_wallet_id = :walletId)",
      )
      .setParameters({
        walletId: id,
        income: CategoryType.INCOME,
        expense: CategoryType.EXPENSE,
        transfer: CategoryType.TRANSFER,
      });

    if (startDate) {
      const start = new Date(startDate);
      qb.andWhere("transaction.date >= :startDate", {
        startDate: start,
      });
    }
    if (endDate) {
      const end = new Date(endDate);
      qb.andWhere("transaction.date <= :endDate", {
        endDate: end,
      });
    }

    const result = await qb.getRawOne();
    const change = parseFloat(result.change) || 0;
    const balance = Number(wallet.initial_balance) + change;

    return {
      ...wallet,
      current_balance: balance,
    };
  }

  async update(
    id: string,
    updateWalletDto: UpdateWalletDto,
    userId: string,
  ): Promise<Wallet> {
    return this.walletsRepository.manager.transaction(
      async (transactionalEntityManager) => {
        if (updateWalletDto.is_main_wallet) {
          await transactionalEntityManager.update(
            Wallet,
            { user_id: userId, id: Not(id) },
            { is_main_wallet: false },
          );
        }
        const wallet = await transactionalEntityManager.findOne(Wallet, {
          where: { id, user_id: userId },
        });
        if (!wallet) {
          throw new NotFoundException(`Wallet with ID "${id}" not found`);
        }
        Object.assign(wallet, updateWalletDto);
        return transactionalEntityManager.save(wallet);
      },
    );
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.walletsRepository.delete({ id, user_id: userId });
    if (result.affected === 0) {
      throw new NotFoundException(`Wallet with ID "${id}" not found`);
    }
  }
}
