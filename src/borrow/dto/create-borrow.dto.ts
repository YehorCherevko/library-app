import { IsDateString, IsUUID, IsOptional } from 'class-validator';

export class CreateBorrowDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  bookId: string;

  @IsOptional()
  @IsDateString()
  borrowDate?: string;

  @IsDateString()
  dueDate: string;
}
