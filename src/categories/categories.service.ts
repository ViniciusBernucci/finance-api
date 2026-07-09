import { Injectable } from '@nestjs/common';

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
}
