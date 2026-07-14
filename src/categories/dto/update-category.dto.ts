import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional() // Esse campo pode nao vir na requisicao
  @IsString()
  @MaxLength(50)
  name?: string; // O ? torna a propriedade opcional em typescript
}
