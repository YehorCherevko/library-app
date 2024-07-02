import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Borrow } from './entity/borrow.entity';
import { CreateBorrowDto } from './dto/create-borrow.dto';
import { User } from '../user/entity/user.entity';
import { Book } from '../book/entity/book.entity';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class BorrowService {
  constructor(
    @InjectRepository(Borrow)
    private borrowRepository: Repository<Borrow>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
    private readonly logger: LoggerService,
  ) {}

  async borrowBook(createBorrowDto: CreateBorrowDto): Promise<Borrow> {
    const { userId, bookId, dueDate } = createBorrowDto;

    this.logger.log(
      `Attempting to borrow book with ID ${bookId} for user ID ${userId}`,
    );

    const user = await this.userRepository.findOne({
      where: { id: userId, deleted_at: null },
    });
    const book = await this.bookRepository.findOne({
      where: { id: bookId, deleted_at: null },
    });

    if (!user || !book) {
      this.logger.warn(
        `User or Book not found: userId=${userId}, bookId=${bookId}`,
      );
      throw new NotFoundException('User or Book not found');
    }

    const borrowDate = new Date();
    const borrow = this.borrowRepository.create({
      user,
      book,
      borrowDate,
      dueDate: new Date(dueDate),
    });

    const savedBorrow = await this.borrowRepository.save(borrow);
    this.logger.log(`Book borrowed successfully: borrowId=${savedBorrow.id}`);

    return savedBorrow;
  }

  async returnBook(borrowId: string): Promise<void> {
    this.logger.log(`Attempting to return book with borrow ID ${borrowId}`);

    const borrow = await this.borrowRepository.findOne({
      where: { id: borrowId },
    });

    if (!borrow) {
      this.logger.warn(`Borrow record not found: borrowId=${borrowId}`);
      throw new NotFoundException('Borrow record not found');
    }

    await this.borrowRepository.remove(borrow);
    this.logger.log(`Book returned successfully: borrowId=${borrowId}`);
  }
}
