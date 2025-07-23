import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Wallet } from "../entities/wallet.entity";
import { CreateWalletDto } from "../dto/create-wallet.dto";
import { UpdateWalletDto } from "../dto/update-wallet.dto";

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private walletsRepository: Repository<Wallet>,
  ) {}

  async create(
    createWalletDto: CreateWalletDto,
    userId: string,
  ): Promise<Wallet> {
    const wallet = this.walletsRepository.create({
      ...createWalletDto,
      user_id: userId,
    });
    return this.walletsRepository.save(wallet);
  }

  async findAll(userId: string): Promise<Wallet[]> {
    return this.walletsRepository.find({ where: { user_id: userId } });
  }

  async findOne(id: string, userId: string): Promise<Wallet> {
    const wallet = await this.walletsRepository.findOne({
      where: { id, user_id: userId },
    });
    if (!wallet) {
      throw new NotFoundException(`Wallet with ID "${id}" not found`);
    }
    return wallet;
  }

  async update(
    id: string,
    updateWalletDto: UpdateWalletDto,
    userId: string,
  ): Promise<Wallet> {
    const wallet = await this.findOne(id, userId);
    Object.assign(wallet, updateWalletDto);
    return this.walletsRepository.save(wallet);
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.walletsRepository.delete({ id, user_id: userId });
    if (result.affected === 0) {
      throw new NotFoundException(`Wallet with ID "${id}" not found`);
    }
  }
}
