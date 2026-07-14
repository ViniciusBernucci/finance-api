import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

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

  // findOne  -> nome do método (convenção do NestJS para "buscar um único registro")
  // id: number -> parâmetro de entrada: o método exige um "id" e o TypeScript
  //               garante que ele seja do tipo number
  // : Category -> tipo de retorno: quem chamar este método SEMPRE receberá
  //               um objeto Category (nunca undefined), por isso o if abaixo
  findOne(id: number): Category {
    // .find() percorre o array "categories" e retorna o PRIMEIRO elemento
    // que satisfaz a condição, ou undefined se nenhum satisfizer.
    //
    // (c) => c.id === id  -> arrow function usada como condição:
    //   - "c" representa cada categoria do array durante a iteração
    //   - "c.id === id" compara o id da categoria atual com o id recebido
    //   - === compara valor E tipo (mais seguro que ==, que faz coerção)
    //
    // Logo, "category" pode ser: Category (achou) OU undefined (não achou)
    const category = this.categories.find((c) => c.id === id);

    // !category -> verifica se "category" é "falsy" (aqui, undefined).
    // Ou seja: se o .find() não encontrou nada, entramos neste bloco.
    if (!category) {
      // throw -> interrompe a execução do método imediatamente, lançando um erro.
      //
      // NotFoundException -> classe de exceção pronta do NestJS (importada
      // de @nestjs/common). O Nest a captura automaticamente e transforma
      // na resposta HTTP 404 (Not Found) com um JSON de erro — você não
      // precisa montar a resposta manualmente.
      //
      // `Categoria com id ${id} ...` -> template literal (crase): permite
      // interpolar variáveis dentro da string usando ${ }.
      throw new NotFoundException(`Categoria com id ${id} Não encontrada`);
    }

    // Se chegou aqui, a categoria existe com certeza.
    // O TypeScript entende isso ("type narrowing"): depois do if com throw,
    // "category" deixa de ser "Category | undefined" e vira só "Category",
    // o que satisfaz o tipo de retorno declarado na assinatura.
    return category;
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

  update(id: number, dto: UpdateCategoryDto): Category {
    const category = this.findOne(id);

    if (dto.name !== undefined) {
      category.name = dto.name;
    }

    return category;
  }

  remove(id: number): void {
    const index = this.categories.findIndex((c) => c.id === id);

    if (index === -1) {
      throw new NotFoundException(`Categoria com id ${id} não encontrada`);
    }

    this.categories.splice(index, 1);
  }
}
