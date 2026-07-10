import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';

export interface Category {
  id: number;
  name: string;
}

@Injectable()
export class CategoriesService {
  //"banco de dados" temporário
  private categories: Category[] = [
    { id: 1, name: 'Alimentação' },
    { id: 2, name: 'Transporte' },
    { id: 3, name: 'Salário' },
  ];

  findAll(): Category[] {
    return this.categories;
  }

  //recebe o DTO tipado, nao any
  create(dto: CreateCategoryDto): Category {
    const newCategory: Category = {
      id: this.categories.length + 1,
      name: dto.name,
    };

    this.categories.push(newCategory);
    return newCategory;
  }
}
