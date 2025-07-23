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
} from "@nestjs/common";
import { CategoriesService } from "../services/categories.service";
import { CreateCategoryDto } from "../dto/create-category.dto";
import { UpdateCategoryDto } from "../dto/update-category.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";

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
  })
  create(@Body() createCategoryDto: CreateCategoryDto, @Request() req) {
    return this.categoriesService.create(createCategoryDto, req.user.id);
  }

  @Get()
  @ApiOperation({
    summary: "Get all categories for the current user (including defaults)",
  })
  findAll(@Request() req) {
    return this.categoriesService.findAll(req.user.id);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a specific category by ID" })
  findOne(@Param("id") id: string, @Request() req) {
    return this.categoriesService.findOne(id, req.user.id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a category" })
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
