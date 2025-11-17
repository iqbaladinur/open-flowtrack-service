import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";
import { MilestoneStatus } from "../entities/milestone.entity";

export class UpdateStatusDto {
  @ApiProperty({
    enum: [
      MilestoneStatus.ACHIEVED,
      MilestoneStatus.FAILED,
      MilestoneStatus.CANCELLED,
    ],
    example: MilestoneStatus.ACHIEVED,
  })
  @IsEnum([
    MilestoneStatus.ACHIEVED,
    MilestoneStatus.FAILED,
    MilestoneStatus.CANCELLED,
  ])
  @IsNotEmpty()
  status: MilestoneStatus.ACHIEVED | MilestoneStatus.FAILED | MilestoneStatus.CANCELLED;
}
