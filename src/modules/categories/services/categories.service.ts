import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Category } from "../entities/category.entity";
import { CreateCategoryDto } from "../dto/create-category.dto";
import { UpdateCategoryDto } from "../dto/update-category.dto";

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
    userId: string,
  ): Promise<Category> {
    const category = this.categoriesRepository.create({
      ...createCategoryDto,
      user_id: userId,
    });
    return this.categoriesRepository.save(category);
  }

  async findAll(userId: string): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: [{ user_id: userId }, { user_id: null }], // Return user's and default categories
    });
  }

  async findOne(id: string, userId: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (
      !category ||
      (category.user_id !== null && category.user_id !== userId)
    ) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }
    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    userId: string,
  ): Promise<Category> {
    const category = await this.findOne(id, userId);
    Object.assign(category, updateCategoryDto);
    return this.categoriesRepository.save(category);
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.categoriesRepository.delete({
      id,
      user_id: userId,
    });
    if (result.affected === 0) {
      throw new NotFoundException(
        `Category with ID "${id}" not found or you don't have permission to delete it.`,
      );
    }
  }
}
