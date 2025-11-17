import { ApiProperty, PartialType } from "@nestjs/swagger";
import { CreateMilestoneDto } from "./create-milestone.dto";

export class UpdateMilestoneDto extends PartialType(CreateMilestoneDto) {}
