import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Borrow } from './entity/borrow.entity';
import { BorrowService } from './borrow.service';
import { BorrowController } from './borrow.controller';
import { User } from '../user/entity/user.entity';
import { Book } from '../book/entity/book.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Borrow, User, Book])],
  providers: [BorrowService],
  controllers: [BorrowController],
})
export class BorrowModule {}
