import { IsUUID, IsInt, IsString, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  bookId: string;

  @IsString()
  reviewText: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;
}
