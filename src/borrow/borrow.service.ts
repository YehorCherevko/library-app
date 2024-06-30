import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Borrow } from './entity/borrow.entity';
import { CreateBorrowDto } from './dto/create-borrow.dto';
import { User } from '../user/entity/user.entity';
import { Book } from '../book/entity/book.entity';

@Injectable()
export class BorrowService {
  constructor(
    @InjectRepository(Borrow)
    private borrowRepository: Repository<Borrow>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
  ) {}

  async borrowBook(createBorrowDto: CreateBorrowDto): Promise<Borrow> {
    const { userId, bookId, dueDate } = createBorrowDto;

    const user = await this.userRepository.findOne({
      where: { id: userId, deleted_at: null },
    });
    const book = await this.bookRepository.findOne({
      where: { id: bookId, deleted_at: null },
    });

    if (!user || !book) {
      throw new NotFoundException('User or Book not found');
    }

    const borrowDate = new Date();

    const borrow = this.borrowRepository.create({
      user,
      book,
      borrowDate,
      dueDate: new Date(dueDate),
    });

    return this.borrowRepository.save(borrow);
  }

  async returnBook(borrowId: string): Promise<void> {
    const borrow = await this.borrowRepository.findOne({
      where: { id: borrowId },
    });

    if (!borrow) {
      throw new NotFoundException('Borrow record not found');
    }

    await this.borrowRepository.remove(borrow);
  }
}
