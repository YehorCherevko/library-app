import { IsString, IsNotEmpty, IsUUID, Length } from 'class-validator';

export class CreateBookDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsUUID()
  authorId: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 20)
  deweyDecimalClassification: string;
}
