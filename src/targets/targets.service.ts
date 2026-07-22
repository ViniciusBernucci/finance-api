import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTargetDto } from './dto/create-target.dto';
import { UpdateTargetDto } from './dto/update-target.dto';
import { UpdateTransactionDto } from '../transactions/dto/update-transaction.dto';

@Injectable()
export class TargetsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.target.findMany();
  }

  async findOne(id: number) {
    const target = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!target) {
      throw new NotFoundException(`Target com id ${id} não encontrada`);
    }

    return target;
  }

  async create(createTargetDto: CreateTargetDto) {
    const categoryExists = await this.prisma.category.findUnique({
      where: { id: createTargetDto.categoryId },
    });

    if (!categoryExists) {
      throw new NotFoundException(
        `Categoria com id ${createTargetDto.categoryId} não encontrada`,
      );
    }
    return this.prisma.target.create({
      data: {
        description: createTargetDto.description,
        month: createTargetDto.month,
        year: createTargetDto.year,
        amount: createTargetDto.amount,
        type: createTargetDto.type,
        date: createTargetDto.date,
        categoryId: createTargetDto.categoryId,
      },
    });
  }

  async update(id: number, updateTargetDto: UpdateTargetDto) {
    await this.findOne(id);

    return this.prisma.target.update({
      where: { id },
      data: updateTargetDto,
    });
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.prisma.target.delete({
      where: { id },
    });
  }
}
