import { Injectable } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entity/book.entity';
import { Author } from '../author/entity/author.entity';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private booksRepository: Repository<Book>,
    @InjectRepository(Author)
    private authoreRepository: Repository<Author>,
  ) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    const author = await this.authoreRepository.findOneBy({
      id: createBookDto.authorId,
    });
    if (!author) {
      throw new Error('Author was not found');
    }

    const book = this.booksRepository.create({ ...createBookDto, author });

    return this.booksRepository.save(book);
  }
}
