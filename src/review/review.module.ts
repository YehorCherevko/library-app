import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entity/review.entity';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { User } from '../user/entity/user.entity';
import { Book } from '../book/entity/book.entity';
import { RedisCacheService } from '../redis/redis-cache.service';
import { LoggerService } from '../logger/logger.service';

@Module({
  imports: [TypeOrmModule.forFeature([Review, User, Book])],
  providers: [ReviewService, RedisCacheService, LoggerService],
  controllers: [ReviewController],
})
export class ReviewModule {}
