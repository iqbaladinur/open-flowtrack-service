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
import { MilestonesService } from "../services/milestones.service";
import { CreateMilestoneDto } from "../dto/create-milestone.dto";
import { UpdateMilestoneDto } from "../dto/update-milestone.dto";
import { UpdateStatusDto } from "../dto/update-status.dto";
import { FindAllMilestonesDto } from "../dto/find-all-milestones.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";

@ApiTags("Milestones")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("milestones")
export class MilestonesController {
  constructor(private readonly milestonesService: MilestonesService) {}

  @Post()
  @ApiOperation({ summary: "Create a new milestone" })
  @ApiResponse({
    status: 201,
    description: "The milestone has been successfully created.",
  })
  create(@Body() createMilestoneDto: CreateMilestoneDto, @Request() req) {
    return this.milestonesService.create(createMilestoneDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: "Get all milestones with progress" })
  @ApiResponse({
    status: 200,
    description:
      "A list of milestones with calculated progress for each condition.",
  })
  @ApiQuery({ name: "status", required: false, enum: ["pending", "in_progress", "achieved", "failed", "cancelled"] })
  @ApiQuery({ name: "sort_by", required: false, enum: ["target_date", "created_at", "name"] })
  @ApiQuery({ name: "order", required: false, enum: ["ASC", "DESC"] })
  findAll(@Request() req, @Query() query: FindAllMilestonesDto) {
    return this.milestonesService.findAll(req.user.id, query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a specific milestone by ID with progress" })
  @ApiResponse({
    status: 200,
    description: "The milestone with current progress.",
  })
  @ApiParam({ name: "id", type: "string" })
  findOne(@Param("id") id: string, @Request() req) {
    return this.milestonesService.findOne(id, req.user.id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a milestone" })
  @ApiResponse({
    status: 200,
    description: "The updated milestone.",
  })
  @ApiParam({ name: "id", type: "string" })
  update(
    @Param("id") id: string,
    @Body() updateMilestoneDto: UpdateMilestoneDto,
    @Request() req,
  ) {
    return this.milestonesService.update(id, updateMilestoneDto, req.user.id);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a milestone" })
  @ApiResponse({
    status: 204,
    description: "The milestone has been successfully deleted.",
  })
  @ApiParam({ name: "id", type: "string" })
  remove(@Param("id") id: string, @Request() req) {
    return this.milestonesService.remove(id, req.user.id);
  }

  @Patch(":id/status")
  @ApiOperation({ summary: "Manually update milestone status" })
  @ApiResponse({
    status: 200,
    description: "The milestone status has been updated.",
  })
  @ApiParam({ name: "id", type: "string" })
  updateStatus(
    @Param("id") id: string,
    @Body() updateStatusDto: UpdateStatusDto,
    @Request() req,
  ) {
    return this.milestonesService.updateStatus(
      id,
      updateStatusDto,
      req.user.id,
    );
  }

  @Get(":id/check-progress")
  @ApiOperation({ summary: "Force check progress (refresh)" })
  @ApiResponse({
    status: 200,
    description: "Returns milestone with freshly calculated progress.",
  })
  @ApiParam({ name: "id", type: "string" })
  checkProgress(@Param("id") id: string, @Request() req) {
    return this.milestonesService.checkProgress(id, req.user.id);
  }
}
