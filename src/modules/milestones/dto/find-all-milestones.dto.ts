import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { MilestoneStatus } from "../entities/milestone.entity";

export enum SortBy {
  TARGET_DATE = "target_date",
  CREATED_AT = "created_at",
  NAME = "name",
}

export enum Order {
  ASC = "ASC",
  DESC = "DESC",
}

export class FindAllMilestonesDto {
  @ApiProperty({
    required: false,
    enum: MilestoneStatus,
    description: "Filter by milestone status",
  })
  @IsOptional()
  @IsEnum(MilestoneStatus)
  status?: MilestoneStatus;

  @ApiProperty({
    required: false,
    enum: SortBy,
    default: SortBy.TARGET_DATE,
    description: "Sort field",
  })
  @IsOptional()
  @IsEnum(SortBy)
  sort_by?: SortBy = SortBy.TARGET_DATE;

  @ApiProperty({
    required: false,
    enum: Order,
    default: Order.ASC,
    description: "Sort order",
  })
  @IsOptional()
  @IsEnum(Order)
  order?: Order = Order.ASC;
}
