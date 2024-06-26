import {
  Post,
  Controller,
  Get,
  Body,
  Param,
  Put,
  Patch,
  Delete,
} from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { BookService } from './book.service';
import { UpdateBookDto } from './dto/update-book.dto';
import { Query } from '@nestjs/common';

@Controller('books')
export class BooksController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  create(@Body() createBookDto: CreateBookDto) {
    return this.bookService.create(createBookDto);
  }

  @Get()
  findAll(@Query('limit') limit: number, @Query('offset') offset: number) {
    return this.bookService.findAll(limit, offset);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.bookService.update(id, updateBookDto);
  }

  @Patch(':id')
  partialUpdate(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.bookService.update(id, updateBookDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookService.remove(id);
  }
}
