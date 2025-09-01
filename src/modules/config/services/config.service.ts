import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Config } from "../entities/config.entity";
import { UpdateConfigDto } from "../dto/update-config.dto";

@Injectable()
export class ConfigService {
  constructor(
    @InjectRepository(Config)
    private configRepository: Repository<Config>,
  ) {}

  async getCurrencyConfig(userId: string): Promise<Config> {
    let config = await this.configRepository.findOne({
      where: { user_id: userId },
    });

    if (!config) {
      config = this.configRepository.create({
        user_id: userId,
        currency: "IDR",
        fractions: 2,
        gemini_api_key: null,
      });
      await this.configRepository.save(config);
    }

    return config;
  }

  async updateCurrencyConfig(
    userId: string,
    updateConfigDto: UpdateConfigDto,
  ): Promise<Config> {
    const config = await this.getCurrencyConfig(userId);
    const updatedConfig = this.configRepository.merge(config, updateConfigDto);
    return this.configRepository.save(updatedConfig);
  }
}
