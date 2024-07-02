import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entity/book.entity';
import { Author } from '../author/entity/author.entity';
import { CreateBookDto } from './dto/create-book.dto';
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
    this.logger.log('Creating a new book');
    const author = await this.authorRepository.findOne({
      where: { id: createBookDto.authorId },
    });
    if (!author) {
      this.logger.warn(`Author with ID ${createBookDto.authorId} not found`);
      throw new NotFoundException('Author not found');
    }

    const book = this.booksRepository.create({ ...createBookDto, author });
    const savedBook = await this.booksRepository.save(book);

    // Invalidate the cache for findAll to ensure new book is included
    await this.cacheService.del('books:all');
    this.logger.log(`New book created with ID ${savedBook.id}`);
    return savedBook;
  }

  async findAll(limit: number, offset: number): Promise<Book[]> {
    this.logger.log('Fetching all books');
    const cacheKey = 'books:all';
    const cachedBooks = await this.cacheService.get(cacheKey);

    if (cachedBooks) {
      this.logger.log('Found all books in cache');
      return JSON.parse(cachedBooks);
    }

    const options: FindManyOptions<Book> = {
      relations: ['author'],
      where: { deleted_at: null },
      take: limit,
      skip: offset,
    };
    const books = await this.booksRepository.find(options);
    await this.cacheService.set(cacheKey, JSON.stringify(books), 3600);
    this.logger.log('Cached all books');
    return books;
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
    this.logger.log(`Updating book with ID ${id}`);
    const book = await this.findOne(id);

    if (updateBookDto.authorId) {
      const author = await this.authorRepository.findOne({
        where: { id: updateBookDto.authorId },
      });
      if (!author) {
        this.logger.warn(`Author with ID ${updateBookDto.authorId} not found`);
        throw new NotFoundException('Author not found');
      }
      book.author = author;
    }

    Object.assign(book, updateBookDto);
    const updatedBook = await this.booksRepository.save(book);
    await this.cacheService.del(`book:${id}`);
    this.logger.log(`Updated book with ID ${id}`);
    return updatedBook;
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Removing book with ID ${id}`);
    const result = await this.booksRepository.softDelete(id);
    if (result.affected === 0) {
      this.logger.warn(`Book with ID ${id} not found`);
      throw new NotFoundException('Book was not found');
    }
    await this.cacheService.del(`book:${id}`);
    this.logger.log(`Removed book with ID ${id}`);
  }
}
