import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAuthorDto } from './dto/create-author.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Author } from './entity/author.entity';
import { UpdateAuthorDto } from './dto/update-author.dto';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(Author)
    private authorsRepository: Repository<Author>,
  ) {}

  async create(createAuthorDto: CreateAuthorDto): Promise<Author> {
    const author = this.authorsRepository.create(createAuthorDto);
    return this.authorsRepository.save(author);
  }

  async findAll(limit: number, offset: number): Promise<Author[]> {
    return this.authorsRepository.find({
      take: limit,
      where: { deleted_at: null },
      skip: offset,
    });
  }

  async findOne(id: string): Promise<Author> {
    const author = await this.authorsRepository.findOne({
      where: { id, deleted_at: null },
      relations: ['books'],
    });
    if (!author) {
      throw new NotFoundException('Author not found');
    }
    return author;
  }

  async update(id: string, updateAuthorDto: UpdateAuthorDto): Promise<Author> {
    const author = await this.authorsRepository.findOne({
      where: { id, deleted_at: null },
      relations: ['books'],
    });

    if (!author) {
      throw new NotFoundException('Author not found or has been deleted');
    }

    Object.assign(author, updateAuthorDto);
    return this.authorsRepository.save(author);
  }

  async remove(id: string): Promise<void> {
    const author = await this.authorsRepository.findOne({
      where: { id, deleted_at: null },
      relations: ['books'],
    });

    if (!author) {
      throw new NotFoundException('Author not found');
    }

    if (author.books && author.books.length > 0) {
      throw new Error('Cannot delete author with existing books');
    }

    await this.authorsRepository.softDelete(id);
  }
}
