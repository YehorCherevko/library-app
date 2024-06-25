import { Post, Controller, Body } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { BookService } from './book.service';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BookService) {}

  @Post()
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }
}
