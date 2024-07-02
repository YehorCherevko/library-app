import { Module } from '@nestjs/common';
import { AuthorsController } from './author.controller';
import { AuthorsService } from './author.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Author } from './entity/author.entity';
import { RedisCacheService } from '../redis/redis-cache.service';
import { LoggerService } from '../logger/logger.service';

@Module({
  imports: [TypeOrmModule.forFeature([Author])],
  controllers: [AuthorsController],
  providers: [AuthorsService, RedisCacheService, LoggerService],
})
export class AuthorModule {}
