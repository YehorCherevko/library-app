import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entity/review.entity';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { User } from '../user/entity/user.entity';
import { Book } from '../book/entity/book.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, User, Book])],
  providers: [ReviewService],
  controllers: [ReviewController],
})
export class ReviewModule {}
