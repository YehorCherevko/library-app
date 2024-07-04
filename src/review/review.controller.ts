import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../user/roles/roles.guard';
import { Roles } from '../user/roles/roles.decorator';
import { UserRole } from '../user/entity/user.entity';

@Controller('reviews')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @Roles(UserRole.USER, UserRole.ADMIN)
  async createReview(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewService.createReview(createReviewDto);
  }

  @Get(':bookId')
  @Roles(UserRole.USER, UserRole.ADMIN)
  async getReviewsForBook(@Param('bookId') bookId: string) {
    return this.reviewService.getReviewsForBook(bookId);
  }
}
