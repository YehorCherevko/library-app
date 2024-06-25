import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entity/book.entity';
import { Author } from '../author/entity/author.entity';
import { UpdateBookDto } from './dto/update-book.dto';
import { FindManyOptions } from 'typeorm';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private booksRepository: Repository<Book>,
    @InjectRepository(Author)
    private authorRepository: Repository<Author>,
  ) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    const author = await this.authorRepository.findOneBy({
      id: createBookDto.authorId,
    });
    if (!author) {
      throw new Error('Author was not found');
    }

    const book = this.booksRepository.create({ ...createBookDto, author });

    return this.booksRepository.save(book);
  }

  async findAll(limit: number, offset: number): Promise<Book[]> {
    const options: FindManyOptions<Book> = {
      relations: ['author'],
      where: { deleted_at: null },
      take: limit,
      skip: offset,
    };
    return this.booksRepository.find(options);
  }

  async findOne(id: string): Promise<Book> {
    const book = await this.booksRepository.findOne({
      where: { id, deleted_at: null },
      relations: ['author'],
    });

    if (!book) {
      throw new NotFoundException('Book was not found');
    }

    return book;
  }

  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    const book = await this.findOne(id);

    if (updateBookDto.authorId) {
      const author = await this.authorRepository.findOneBy({
        id: updateBookDto.authorId,
      });
      if (!author) {
        throw new NotFoundException('Author not found');
      }
      book.author = author;
    }

    Object.assign(book, updateBookDto);
    return this.booksRepository.save(book);
  }

  async remove(id: string): Promise<void> {
    const result = await this.booksRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Book was mot found');
    }
  }
}
