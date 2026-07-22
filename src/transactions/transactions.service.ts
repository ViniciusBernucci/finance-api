import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.transaction.findMany();
  }

  async findOne(id: number) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException(`Transação com id ${id} não encontrada`);
    }

    return transaction;
  }

  async create(createTransactionDto: CreateTransactionDto) {
    const categoryExists = await this.prisma.category.findUnique({
      where: { id: createTransactionDto.categoryId },
    });

    if (!categoryExists) {
      throw new NotFoundException(
        `Categoria com id ${createTransactionDto.categoryId} não encontrada`,
      );
    }
    return this.prisma.transaction.create({
      data: {
        description: createTransactionDto.description,
        amount: createTransactionDto.amount,
        type: createTransactionDto.type,
        date: createTransactionDto.date,
        categoryId: createTransactionDto.categoryId,
      },
    });
  }

  async update(id: number, updateTransactionDto: UpdateTransactionDto) {
    await this.findOne(id);

    return this.prisma.transaction.update({
      where: { id },
      data: updateTransactionDto,
    });
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.prisma.transaction.delete({
      where: { id },
    });
  }
}
