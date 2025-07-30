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
    schema: {
      example: {
        id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        name: "My Bank Account",
        initial_balance: 1000.0,
        user_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        created_at: "2025-07-28T00:00:00.000Z",
        updated_at: "2025-07-28T00:00:00.000Z",
      },
    },
  })
  create(@Body() createWalletDto: CreateWalletDto, @Request() req) {
    return this.walletsService.create(createWalletDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: "Get all wallets for the current user" })
  @ApiResponse({
    status: 200,
    description: "A list of wallets with their current balances.",
    schema: {
      example: [
        {
          id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
          name: "My Bank Account",
          initial_balance: 1000.0,
          user_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
          created_at: "2025-07-28T00:00:00.000Z",
          updated_at: "2025-07-28T00:00:00.000Z",
          current_balance: 1250.5,
        },
      ],
    },
  })
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
  @ApiResponse({
    status: 200,
    description: "The wallet with its current balance.",
    schema: {
      example: {
        id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        name: "My Bank Account",
        initial_balance: 1000.0,
        user_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        created_at: "2025-07-28T00:00:00.000Z",
        updated_at: "2025-07-28T00:00:00.000Z",
        current_balance: 1250.5,
      },
    },
  })
  @ApiQuery({ name: "start_date", required: false, type: Date })
  @ApiQuery({ name: "end_date", required: false, type: Date })
  findOne(
    @Param("id") id: string,
    @Request() req,
    @Query("start_date") startDate?: Date,
    @Query("end_date") endDate?: Date,
  ) {
    return this.walletsService.findOne(id, req.user.id, startDate, endDate);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a wallet" })
  @ApiResponse({
    status: 200,
    description: "The updated wallet.",
    schema: {
      example: {
        id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        name: "My Updated Bank Account",
        initial_balance: 1500.0,
        user_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        created_at: "2025-07-28T00:00:00.000Z",
        updated_at: "2025-07-28T00:00:00.000Z",
      },
    },
  })
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
