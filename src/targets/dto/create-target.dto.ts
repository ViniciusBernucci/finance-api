import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsNumber,
  IsPositive,
  IsDateString,
  IsInt,
} from 'class-validator';

export class CreateTargetDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  description!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  month!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  year!: string;

  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsDateString()
  date!: string;

  @IsInt()
  @IsPositive()
  categoryId!: number;
}
