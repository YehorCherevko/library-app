// src/borrow/borrow.controller.ts
import {
  Controller,
  Post,
  Body,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { BorrowService } from './borrow.service';
import { CreateBorrowDto } from './dto/create-borrow.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../user/roles/roles.guard';
import { Roles } from '../user/roles/roles.decorator';
import { UserRole } from '../user/entity/user.entity';

@Controller('borrow')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class BorrowController {
  constructor(private readonly borrowService: BorrowService) {}

  @Post()
  @Roles(UserRole.USER, UserRole.ADMIN)
  async borrowBook(@Body() createBorrowDto: CreateBorrowDto) {
    return this.borrowService.borrowBook(createBorrowDto);
  }

  @Delete(':id')
  @Roles(UserRole.USER, UserRole.ADMIN)
  async returnBook(@Param('id') id: string) {
    return this.borrowService.returnBook(id);
  }
}
