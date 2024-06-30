import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entity/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { User } from '../user/entity/user.entity';
import { Book } from '../book/entity/book.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
  ) {}

  async createReview(createReviewDto: CreateReviewDto): Promise<Review> {
    const { userId, bookId, reviewText, rating } = createReviewDto;

    const user = await this.userRepository.findOne({
      where: { id: userId, deleted_at: null },
    });
    const book = await this.bookRepository.findOne({
      where: { id: bookId, deleted_at: null },
    });

    if (!user || !book) {
      throw new NotFoundException('User or Book not found');
    }

    const review = this.reviewRepository.create({
      user,
      book,
      reviewText,
      rating,
    });

    return this.reviewRepository.save(review);
  }

  async getReviewsForBook(bookId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { book: { id: bookId } },
      relations: ['user'],
    });
  }
}
