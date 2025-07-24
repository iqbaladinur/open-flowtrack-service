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
  ApiQuery,
} from "@nestjs/swagger";
import { CategoryType } from "../../categories/entities/category.entity";

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
  })
  create(@Body() createTransactionDto: CreateTransactionDto, @Request() req) {
    return this.transactionsService.create(createTransactionDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: "Get all transactions for the current user" })
  @ApiQuery({ name: "start_date", required: false, type: Date })
  @ApiQuery({ name: "end_date", required: false, type: Date })
  @ApiQuery({ name: "wallet_id", required: false, type: String })
  @ApiQuery({ name: "category_id", required: false, type: String })
  @ApiQuery({ name: "type", required: false, enum: CategoryType })
  findAll(
    @Request() req,
    @Query("start_date") startDate?: Date,
    @Query("end_date") endDate?: Date,
    @Query("wallet_id") walletId?: string,
    @Query("category_id") categoryId?: string,
    @Query("type") type?: CategoryType,
  ) {
    return this.transactionsService.findAll(
      req.user.id,
      startDate,
      endDate,
      walletId,
      categoryId,
      type,
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a specific transaction by ID" })
  findOne(@Param("id") id: string, @Request() req) {
    return this.transactionsService.findOne(id, req.user.id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a transaction" })
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
