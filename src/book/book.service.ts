import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entity/book.entity';
import { Author } from '../author/entity/author.entity';
import { UpdateBookDto } from './dto/update-book.dto';
import { FindManyOptions } from 'typeorm';
import { RedisCacheService } from '../redis/redis-cache.service';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private booksRepository: Repository<Book>,
    @InjectRepository(Author)
    private authorRepository: Repository<Author>,
    private readonly cacheService: RedisCacheService,
    private readonly logger: LoggerService,
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
    this.logger.log(`Fetching book with ID ${id}`);

    const cacheKey = `book:${id}`;
    const cachedBook = await this.cacheService.get(cacheKey);

    if (cachedBook) {
      this.logger.log(`Found book with ID ${id} in cache`);
      return JSON.parse(cachedBook);
    }

    const book = await this.booksRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!book) {
      this.logger.warn(`Book with ID ${id} not found`);
      throw new NotFoundException('Book was not found');
    }

    await this.cacheService.set(cacheKey, JSON.stringify(book), 3600);
    this.logger.log(`Cached book with ID ${id}`);
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
