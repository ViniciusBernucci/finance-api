import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  //injeção via construtor - o Nest cria o categoriesService e entrega aqui
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  // ParseIntPipe converte o parâmetro de URL (que sempre chega como string) para number,
  // e já retorna 400 automaticamente se não for um número válido
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  // @Body() extrai o corpo JSON da requisição e o Nest tenta "encaixar" no formato do DTO
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    //Aqui, :id  diz "esse pedaço da URL é um parâmetro chamado id". E @Param('id', ...)
    // no método diz "pegue esse valor específico da URL e me entregue como argumento da função".
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    this.categoriesService.remove(id);
  }
}
