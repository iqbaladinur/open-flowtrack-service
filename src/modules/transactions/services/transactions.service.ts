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
import { CategoryType } from "src/modules/categories/entities/category.entity";
import { AiProvider } from "src/infrastructure/ai/ai.provider";
import { ConfigService } from "src/modules/config/services/config.service";

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    private categoriesService: CategoriesService,
    private aiProvider: AiProvider,
    private configService: ConfigService,
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
    // if (start) {
    //   start.setHours(0, 0, 0, 0);
    // }

    const end = query.end_date ? new Date(query.end_date) : undefined;
    // if (end) {
    //   end.setHours(23, 59, 59, 999);
    // }

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
