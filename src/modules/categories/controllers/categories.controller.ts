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
import { CategoriesService } from "../services/categories.service";
import { CreateCategoryDto } from "../dto/create-category.dto";
import { UpdateCategoryDto } from "../dto/update-category.dto";
import { BulkCreateCategoryDto } from "../dto/bulk-create-category.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from "@nestjs/swagger";
import { CategoryType } from "../entities/category.entity";

@ApiTags("Categories")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: "Create a new category" })
  @ApiResponse({
    status: 201,
    description: "The category has been successfully created.",
    schema: {
      example: {
        id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        name: "Salary",
        type: "income",
        icon: "briefcase-outline",
        color: "#26de81",
        user_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        created_at: "2025-07-28T00:00:00.000Z",
        updated_at: "2025-07-28T00:00:00.000Z",
      },
    },
  })
  create(@Body() createCategoryDto: CreateCategoryDto, @Request() req) {
    return this.categoriesService.create(createCategoryDto, req.user.id);
  }

  @Post("bulk")
  @ApiOperation({ summary: "Create multiple categories in bulk" })
  @ApiBody({ type: BulkCreateCategoryDto })
  @ApiResponse({
    status: 201,
    description: "The categories have been successfully created.",
    schema: {
      example: [
        {
          id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
          name: "Salary",
          type: "income",
          icon: "briefcase-outline",
          color: "#26de81",
          user_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
          created_at: "2025-07-28T00:00:00.000Z",
          updated_at: "2025-07-28T00:00:00.000Z",
        },
        {
          id: "b2c3d4e5-f6g7-8901-2345-67890abcdef1",
          name: "Groceries",
          type: "expense",
          icon: "cart-outline",
          color: "#ff6b6b",
          user_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
          created_at: "2025-07-28T00:00:01.000Z",
          updated_at: "2025-07-28T00:00:01.000Z",
        },
      ],
    },
  })
  createBulk(
    @Body() bulkCreateCategoryDto: BulkCreateCategoryDto,
    @Request() req,
  ) {
    return this.categoriesService.bulkCreate(
      bulkCreateCategoryDto.categories,
      req.user.id,
    );
  }

  @Get()
  @ApiOperation({
    summary: "Get all categories for the current user (including defaults)",
  })
  @ApiResponse({
    status: 200,
    description: "A list of categories.",
    schema: {
      example: [
        {
          id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
          name: "Salary",
          type: "income",
          icon: "briefcase-outline",
          color: "#26de81",
          user_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
          created_at: "2025-07-28T00:00:00.000Z",
          updated_at: "2025-07-28T00:00:00.000Z",
        },
      ],
    },
  })
  @ApiQuery({ name: "type", required: false, enum: CategoryType })
  findAll(@Request() req, @Query("type") type?: CategoryType) {
    return this.categoriesService.findAll(req.user.id, type);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a specific category by ID" })
  @ApiResponse({
    status: 200,
    description: "The category.",
    schema: {
      example: {
        id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        name: "Salary",
        type: "income",
        icon: "briefcase-outline",
        color: "#26de81",
        user_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        created_at: "2025-07-28T00:00:00.000Z",
        updated_at: "2025-07-28T00:00:00.000Z",
      },
    },
  })
  findOne(@Param("id") id: string, @Request() req) {
    return this.categoriesService.findOne(id, req.user.id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a category" })
  @ApiResponse({
    status: 200,
    description: "The updated category.",
    schema: {
      example: {
        id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        name: "Freelance Income",
        type: "income",
        icon: "laptop-outline",
        color: "#45aaf2",
        user_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        created_at: "2025-07-28T00:00:00.000Z",
        updated_at: "2025-07-28T00:00:00.000Z",
      },
    },
  })
  update(
    @Param("id") id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Request() req,
  ) {
    return this.categoriesService.update(id, updateCategoryDto, req.user.id);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a category" })
  @ApiResponse({
    status: 204,
    description: "The category has been successfully deleted.",
  })
  remove(@Param("id") id: string, @Request() req) {
    return this.categoriesService.remove(id, req.user.id);
  }
}
