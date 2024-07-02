import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Author } from './entity/author.entity';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { RedisCacheService } from '../redis/redis-cache.service';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(Author)
    private authorsRepository: Repository<Author>,
    private readonly cacheService: RedisCacheService,
    private readonly logger: LoggerService,
  ) {}

  async create(createAuthorDto: CreateAuthorDto): Promise<Author> {
    this.logger.log('Creating a new author');
    const author = this.authorsRepository.create(createAuthorDto);
    const savedAuthor = await this.authorsRepository.save(author);

    // Invalidate the cache for findAll to ensure new author is included
    await this.cacheService.del('authors:all');
    this.logger.log(`New author created with ID ${savedAuthor.id}`);
    return savedAuthor;
  }

  async findAll(limit: number, offset: number): Promise<Author[]> {
    this.logger.log('Fetching all authors');
    const cacheKey = 'authors:all';
    const cachedAuthors = await this.cacheService.get(cacheKey);

    if (cachedAuthors) {
      this.logger.log('Found all authors in cache');
      return JSON.parse(cachedAuthors);
    }

    const authors = await this.authorsRepository.find({
      take: limit,
      where: { deleted_at: null },
      skip: offset,
    });
    await this.cacheService.set(cacheKey, JSON.stringify(authors), 3600);
    this.logger.log('Cached all authors');
    return authors;
  }

  async findOne(id: string): Promise<Author> {
    this.logger.log(`Fetching author with ID ${id}`);
    const cacheKey = `author:${id}`;
    const cachedAuthor = await this.cacheService.get(cacheKey);

    if (cachedAuthor) {
      this.logger.log(`Found author with ID ${id} in cache`);
      return JSON.parse(cachedAuthor);
    }

    const author = await this.authorsRepository.findOne({
      where: { id, deleted_at: null },
      relations: ['books'],
    });
    if (!author) {
      this.logger.warn(`Author with ID ${id} not found`);
      throw new NotFoundException('Author not found');
    }

    await this.cacheService.set(cacheKey, JSON.stringify(author), 3600);
    this.logger.log(`Cached author with ID ${id}`);
    return author;
  }

  async update(id: string, updateAuthorDto: UpdateAuthorDto): Promise<Author> {
    this.logger.log(`Updating author with ID ${id}`);
    const author = await this.authorsRepository.findOne({
      where: { id, deleted_at: null },
      relations: ['books'],
    });

    if (!author) {
      this.logger.warn(`Author with ID ${id} not found or has been deleted`);
      throw new NotFoundException('Author not found or has been deleted');
    }

    Object.assign(author, updateAuthorDto);
    const updatedAuthor = await this.authorsRepository.save(author);
    await this.cacheService.del(`author:${id}`);
    this.logger.log(`Updated author with ID ${id}`);
    return updatedAuthor;
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Removing author with ID ${id}`);
    const author = await this.authorsRepository.findOne({
      where: { id, deleted_at: null },
      relations: ['books'],
    });

    if (!author) {
      this.logger.warn(`Author with ID ${id} not found`);
      throw new NotFoundException('Author not found');
    }

    if (author.books && author.books.length > 0) {
      this.logger.warn(
        `Cannot delete author with existing books: authorId=${id}`,
      );
      throw new Error('Cannot delete author with existing books');
    }

    await this.authorsRepository.softDelete(id);
    await this.cacheService.del(`author:${id}`);
    this.logger.log(`Removed author with ID ${id}`);
  }
}
