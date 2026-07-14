import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString() //Precisa ser uma string
  @IsNotEmpty() //nao pode ser vazio
  @MaxLength(50) //Limite de tamanho por nome
  name!: string;
}
