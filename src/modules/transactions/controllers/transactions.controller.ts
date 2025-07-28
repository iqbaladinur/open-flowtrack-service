import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from "@nestjs/common";
import { TransactionsService } from "../services/transactions.service";
import { CreateTransactionDto } from "../dto/create-transaction.dto";
import { UpdateTransactionDto } from "../dto/update-transaction.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";
import { FindAllTransactionsDto } from "../dto/find-all-transactions.dto";

@ApiTags("Transactions")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("transactions")
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new transaction" })
  @ApiResponse({
    status: 201,
    description: "The transaction has been successfully created.",
    schema: {
      example: {
        id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        type: "expense",
        amount: 50.0,
        wallet_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        category_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        date: "2025-07-28T00:00:00.000Z",
        note: "Lunch",
        is_recurring: false,
        recurring_pattern: null,
        user_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        created_at: "2025-07-28T00:00:00.000Z",
        updated_at: "2025-07-28T00:00:00.000Z",
      },
    },
  })
  create(@Body() createTransactionDto: CreateTransactionDto, @Request() req) {
    return this.transactionsService.create(createTransactionDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: "Get all transactions for the current user" })
  @ApiResponse({
    status: 200,
    description: "A list of transactions.",
    schema: {
      example: [
        {
          id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
          type: "expense",
          amount: 50.0,
          wallet_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
          category_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
          date: "2025-07-28T00:00:00.000Z",
          note: "Lunch",
          is_recurring: false,
          recurring_pattern: null,
          user_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
          created_at: "2025-07-28T00:00:00.000Z",
          updated_at: "2025-07-28T00:00:00.000Z",
        },
      ],
    },
  })
  findAll(@Request() req, @Query() query: FindAllTransactionsDto) {
    return this.transactionsService.findAll(req.user.id, query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a specific transaction by ID" })
  @ApiResponse({
    status: 200,
    description: "The transaction.",
    schema: {
      example: {
        id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        type: "expense",
        amount: 50.0,
        wallet_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        category_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        date: "2025-07-28T00:00:00.000Z",
        note: "Lunch",
        is_recurring: false,
        recurring_pattern: null,
        user_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        created_at: "2025-07-28T00:00:00.000Z",
        updated_at: "2025-07-28T00:00:00.000Z",
      },
    },
  })
  findOne(@Param("id") id: string, @Request() req) {
    return this.transactionsService.findOne(id, req.user.id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a transaction" })
  @ApiResponse({
    status: 200,
    description: "The updated transaction.",
    schema: {
      example: {
        id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        type: "expense",
        amount: 75.0,
        wallet_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        category_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        date: "2025-07-28T00:00:00.000Z",
        note: "Dinner",
        is_recurring: false,
        recurring_pattern: null,
        user_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        created_at: "2025-07-28T00:00:00.000Z",
        updated_at: "2025-07-28T00:00:00.000Z",
      },
    },
  })
  update(
    @Param("id") id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @Request() req,
  ) {
    return this.transactionsService.update(
      id,
      updateTransactionDto,
      req.user.id,
    );
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a transaction" })
  @ApiResponse({
    status: 204,
    description: "The transaction has been successfully deleted.",
  })
  remove(@Param("id") id: string, @Request() req) {
    return this.transactionsService.remove(id, req.user.id);
  }
}
