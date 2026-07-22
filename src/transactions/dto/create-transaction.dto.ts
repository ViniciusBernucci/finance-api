import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsNumber,
  IsPositive,
  IsDateString,
  IsInt,
} from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  description!: string;

  @IsNumber()
  @IsPositive() // não faz sentido uma transação com valor negativo ou zero
  amount!: number;

  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsDateString() // valida que a string é uma data ISO válida (ex: "2026-07-16")
  date!: string;

  @IsInt()
  @IsPositive()
  categoryId!: number;
}
