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
import { WalletsService } from "../services/wallets.service";
import { CreateWalletDto } from "../dto/create-wallet.dto";
import { UpdateWalletDto } from "../dto/update-wallet.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from "@nestjs/swagger";

@ApiTags("Wallets")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("wallets")
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new wallet" })
  @ApiResponse({
    status: 201,
    description: "The wallet has been successfully created.",
  })
  create(@Body() createWalletDto: CreateWalletDto, @Request() req) {
    return this.walletsService.create(createWalletDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: "Get all wallets for the current user" })
  @ApiQuery({ name: "start_date", required: false, type: Date })
  @ApiQuery({ name: "end_date", required: false, type: Date })
  findAll(
    @Request() req,
    @Query("start_date") startDate?: Date,
    @Query("end_date") endDate?: Date,
  ) {
    return this.walletsService.findAll(req.user.id, startDate, endDate);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a specific wallet by ID" })
  findOne(@Param("id") id: string, @Request() req) {
    return this.walletsService.findOne(id, req.user.id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a wallet" })
  update(
    @Param("id") id: string,
    @Body() updateWalletDto: UpdateWalletDto,
    @Request() req,
  ) {
    return this.walletsService.update(id, updateWalletDto, req.user.id);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a wallet" })
  @ApiResponse({
    status: 204,
    description: "The wallet has been successfully deleted.",
  })
  remove(@Param("id") id: string, @Request() req) {
    return this.walletsService.remove(id, req.user.id);
  }
}
