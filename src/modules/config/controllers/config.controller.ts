import { Body, Controller, Get, Put, UseGuards, Req } from "@nestjs/common";
import { ConfigService } from "../services/config.service";
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "src/modules/auth/guards/jwt-auth.guard";
import { UpdateConfigDto } from "../dto/update-config.dto";

@ApiTags("Config")
@Controller("config")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  @ApiOperation({ summary: "Get currency configuration for the current user" })
  @ApiResponse({
    status: 200,
    description: "Returns the currency configuration for the current user.",
  })
  getCurrencyConfig(@Req() req) {
    return this.configService.getCurrencyConfig(req.user.id);
  }

  @Put()
  @ApiOperation({
    summary: "Update currency configuration for the current user",
  })
  @ApiResponse({
    status: 200,
    description:
      "Updates and returns the new currency configuration for the current user.",
  })
  updateCurrencyConfig(@Req() req, @Body() updateConfigDto: UpdateConfigDto) {
    return this.configService.updateCurrencyConfig(
      req.user.id,
      updateConfigDto,
    );
  }
}
