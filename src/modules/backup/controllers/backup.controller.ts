import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Res,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiBody,
} from "@nestjs/swagger";
import { Response } from "express";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { BackupService } from "../services/backup.service";

@ApiTags("Backup & Restore")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("backup")
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Get()
  @ApiOperation({ summary: "Backup user data" })
  async backup(@Request() req, @Res() res: Response) {
    const data = await this.backupService.backup(req.user);
    res.header("Content-Type", "application/json");
    res.attachment("backup.json");
    res.send(data);
  }

  @Post("restore")
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @ApiOperation({ summary: "Restore user data" })
  async restore(@Request() req, @UploadedFile() file) {
    const data = JSON.parse(file.buffer.toString());
    return await this.backupService.restore(req.user, data);
  }
}
