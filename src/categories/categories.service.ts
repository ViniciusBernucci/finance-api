import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

export interface Category {
  id: number;
  name: string;
}

@Injectable()
export class CategoriesService {
  //injeta via construtor - mesmo mecanismo que já vimos com o proprio CategoriesService
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    // this.prisma.category vem automaticamente do PrismaClient,
    // gerado a partir do model "Category" que você definiu no schema.prisma
    return this.prisma.category.findMany();
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Categoria com id ${id} não encontrada`);
    }

    return category;
  }

  create(dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        name: dto.name,
      },
    });
  }

  async update(id: number, dto: UpdateCategoryDto) {
    await this.findOne(id); // reaproveita a checagem de existência + erro 404

    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id); // mesma lógica: garante que existe antes de tentar remover

    await this.prisma.category.delete({
      where: { id },
    });
  }
}
