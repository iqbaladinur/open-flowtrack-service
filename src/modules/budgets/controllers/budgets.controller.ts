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
import { BudgetsService } from "../services/budgets.service";
import { CreateBudgetDto } from "../dto/create-budget.dto";
import { UpdateBudgetDto } from "../dto/update-budget.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";
import { FindAllBudgetsDto } from "../dto/find-all-budgets.dto";

@ApiTags("Budgets")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("budgets")
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new budget" })
  @ApiResponse({
    status: 201,
    description: "The budget has been successfully created.",
    schema: {
      example: {
        id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        category_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        limit_amount: 500.0,
        month: 7,
        year: 2025,
        user_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        created_at: "2025-07-28T00:00:00.000Z",
        updated_at: "2025-07-28T00:00:00.000Z",
        total_spent: 150.0,
      },
    },
  })
  create(@Body() createBudgetDto: CreateBudgetDto, @Request() req) {
    return this.budgetsService.create(createBudgetDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: "Get all budgets for the current user" })
  @ApiResponse({
    status: 200,
    description: "A list of budgets with their spent amounts.",
    schema: {
      example: [
        {
          id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
          category_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
          limit_amount: 500.0,
          month: 7,
          year: 2025,
          user_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
          created_at: "2025-07-28T00:00:00.000Z",
          updated_at: "2025-07-28T00:00:00.000Z",
          total_spent: 150.0,
        },
      ],
    },
  })
  findAll(@Request() req, @Query() query: FindAllBudgetsDto) {
    return this.budgetsService.findAll(req.user.id, query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a specific budget by ID" })
  @ApiResponse({
    status: 200,
    description: "The budget with its spent amount.",
    schema: {
      example: {
        id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        category_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        limit_amount: 500.0,
        month: 7,
        year: 2025,
        user_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        created_at: "2025-07-28T00:00:00.000Z",
        updated_at: "2025-07-28T00:00:00.000Z",
        total_spent: 150.0,
      },
    },
  })
  findOne(@Param("id") id: string, @Request() req) {
    return this.budgetsService.findOne(id, req.user.id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a budget" })
  @ApiResponse({
    status: 200,
    description: "The updated budget.",
    schema: {
      example: {
        id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        category_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        limit_amount: 600.0,
        month: 7,
        year: 2025,
        user_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        created_at: "2025-07-28T00:00:00.000Z",
        updated_at: "2025-07-28T00:00:00.000Z",
        total_spent: 150.0,
      },
    },
  })
  update(
    @Param("id") id: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
    @Request() req,
  ) {
    return this.budgetsService.update(id, updateBudgetDto, req.user.id);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a budget" })
  @ApiResponse({
    status: 204,
    description: "The budget has been successfully deleted.",
  })
  remove(@Param("id") id: string, @Request() req) {
    return this.budgetsService.remove(id, req.user.id);
  }
}
