import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Author } from 'src/author/entity/author.entity';
import { Book } from './entity/book.entity';
import { BooksController } from './book.controller';
import { BookService } from './book.service';
import { RedisCacheService } from '../redis/redis-cache.service';
import { LoggerService } from '../logger/logger.service';

@Module({
  imports: [TypeOrmModule.forFeature([Book, Author])],
  controllers: [BooksController],
  providers: [BookService, RedisCacheService, LoggerService],
})
export class BooksModule {}
