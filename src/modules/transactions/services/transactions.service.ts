import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
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
import { CreateTransactionByTextDto } from "../dto/create-transaction-by-text.dto";
import { CategoriesService } from "src/modules/categories/services/categories.service";
import {
  Category,
  CategoryType,
} from "src/modules/categories/entities/category.entity";
import { AiProvider } from "src/infrastructure/ai/ai.provider";
import { ConfigService } from "src/modules/config/services/config.service";
import { Wallet } from "src/modules/wallets/entities/wallet.entity";

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectRepository(Wallet)
    private walletsRepository: Repository<Wallet>,
    private categoriesService: CategoriesService,
    private aiProvider: AiProvider,
    private configService: ConfigService,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async createByText(
    createTransactionByTextDto: CreateTransactionByTextDto,
    userId: string,
  ): Promise<any> {
    const config = await this.configService.getCurrencyConfig(userId);
    if (!config.gemini_api_key) {
      throw new BadRequestException(
        "AI features are not available. Please configure your Gemini API key in settings.",
      );
    }

    const categories = await this.categoriesService.findAll(
      userId,
      CategoryType.EXPENSE,
    );

    const categoryList = JSON.stringify(
      categories.map((c) => ({ id: c.id, name: c.name })),
    );

    const ocrText = createTransactionByTextDto.content;

    const prompt = `
    Extract transactions from the OCR receipt text into JSON.
    Rules:
    - Output must be a valid JSON array only (no explanation).
    - Each object format:
      {
        "amount": number,
        "category_id": string,
        "note": string
      }
    - Match category_id from provided categories.
    - Parse date from receipt.
    - If unsure about note, keep it empty.

    OCR text:
    """
    ${ocrText}
    """

    Categories:
    """
    ${categoryList}
    """
    `;

    const aiResult = await this.aiProvider.generateText(prompt);
    const cleanedJson = aiResult
      .replace(/```json\n/g, "")
      .replace(/\n```/g, "");

    try {
      const parsedResult = JSON.parse(cleanedJson);
      return parsedResult;
    } catch (error) {
      console.error("Failed to parse AI response:", cleanedJson);
      throw new Error(
        "Could not interpret the transaction from the provided text.",
      );
    }
  }

  async create(
    createTransactionDto: CreateTransactionDto,
    userId: string,
  ): Promise<Transaction> {
    if (createTransactionDto.type === CategoryType.TRANSFER) {
      if (!createTransactionDto.destination_wallet_id) {
        throw new BadRequestException(
          "Destination wallet is required for transfer transactions.",
        );
      }
      if (createTransactionDto.category_id) {
        throw new BadRequestException(
          "Category should not be specified for transfer transactions.",
        );
      }
      if (
        createTransactionDto.wallet_id ===
        createTransactionDto.destination_wallet_id
      ) {
        throw new BadRequestException(
          "Source and destination wallets cannot be the same.",
        );
      }
      const destinationWallet = await this.walletsRepository.findOne({
        where: {
          id: createTransactionDto.destination_wallet_id,
          user_id: userId,
        },
      });
      if (!destinationWallet) {
        throw new NotFoundException("Destination wallet not found");
      }
      createTransactionDto.category_id = null;
    } else {
      if (!createTransactionDto.category_id) {
        throw new BadRequestException(
          "Category is required for income/expense transactions.",
        );
      }
      if (createTransactionDto.destination_wallet_id) {
        throw new BadRequestException(
          "Destination wallet should not be specified for income/expense transactions.",
        );
      }
    }

    const wallet = await this.walletsRepository.findOne({
      where: { id: createTransactionDto.wallet_id, user_id: userId },
    });

    if (!wallet) {
      throw new NotFoundException("Wallet not found");
    }

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
    const baseWhere: FindOptionsWhere<Transaction> = { user_id: userId };

    const start = query.start_date ? new Date(query.start_date) : undefined;
    const end = query.end_date ? new Date(query.end_date) : undefined;

    if (start && end) {
      baseWhere.date = Between(start, end);
    } else if (start) {
      baseWhere.date = MoreThanOrEqual(start);
    } else if (end) {
      baseWhere.date = LessThanOrEqual(end);
    }

    if (query.category_id) {
      baseWhere.category_id = query.category_id;
    }
    if (query.type) {
      baseWhere.type = query.type;
    }

    let where: FindOptionsWhere<Transaction> | FindOptionsWhere<Transaction>[];

    if (query.wallet_id) {
      where = [
        { ...baseWhere, wallet_id: query.wallet_id },
        { ...baseWhere, destination_wallet_id: query.wallet_id },
      ];
    } else {
      where = baseWhere;
    }

    const order: FindOptionsOrder<Transaction> = {
      date: query.sortBy || "DESC",
      created_at: query.sortBy || "DESC",
    };

    return this.transactionsRepository.find({
      where,
      relations: ["category", "wallet", "destinationWallet"],
      order,
    });
  }

  async findOne(id: string, userId: string): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id, user_id: userId },
      relations: ["category", "wallet", "destinationWallet"],
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

    // Apply incoming changes to the entity
    Object.assign(transaction, updateTransactionDto);

    // Re-validate and adjust based on transaction type
    if (transaction.type === CategoryType.TRANSFER) {
      if (!transaction.destination_wallet_id) {
        throw new BadRequestException(
          "Destination wallet is required for transfer transactions.",
        );
      }
      if (transaction.wallet_id === transaction.destination_wallet_id) {
        throw new BadRequestException(
          "Source and destination wallets cannot be the same.",
        );
      }
      // Transfers must not have a category
      transaction.category = null;
      transaction.category_id = null;
    } else {
      // INCOME or EXPENSE
      if (!transaction.category_id) {
        throw new BadRequestException(
          "Category is required for income/expense transactions.",
        );
      }
      // Non-transfers must not have a destination wallet
      transaction.destinationWallet = null;
      transaction.destination_wallet_id = null;
    }

    // If wallet ID was part of the update, fetch and validate it
    if (updateTransactionDto.wallet_id) {
      const wallet = await this.walletsRepository.findOne({
        where: { id: updateTransactionDto.wallet_id, user_id: userId },
      });
      if (!wallet) {
        throw new NotFoundException("Wallet not found");
      }
      transaction.wallet = wallet;
    }

    // If destination wallet ID was part of the update, fetch and validate it
    if (updateTransactionDto.destination_wallet_id) {
      const destinationWallet = await this.walletsRepository.findOne({
        where: {
          id: updateTransactionDto.destination_wallet_id,
          user_id: userId,
        },
      });
      if (!destinationWallet) {
        throw new NotFoundException("Destination wallet not found");
      }
      transaction.destinationWallet = destinationWallet;
    }

    if (updateTransactionDto.category_id) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateTransactionDto.category_id, user_id: userId },
      });
      if (!category) {
        throw new NotFoundException("Category not found");
      }
      transaction.category = category;
    }

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
