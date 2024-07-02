import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entity/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { User } from '../user/entity/user.entity';
import { Book } from '../book/entity/book.entity';
import { RedisCacheService } from '../redis/redis-cache.service';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
    private readonly cacheService: RedisCacheService,
    private readonly logger: LoggerService,
  ) {}

  async createReview(createReviewDto: CreateReviewDto): Promise<Review> {
    const { userId, bookId, reviewText, rating } = createReviewDto;

    this.logger.log(
      `Attempting to create review for book ID ${bookId} by user ID ${userId}`,
    );

    const user = await this.userRepository.findOne({
      where: { id: userId, deleted_at: null },
    });
    const book = await this.bookRepository.findOne({
      where: { id: bookId, deleted_at: null },
    });

    if (!user || !book) {
      this.logger.warn(
        `User or Book not found: userId=${userId}, bookId=${bookId}`,
      );
      throw new NotFoundException('User or Book not found');
    }

    const review = this.reviewRepository.create({
      user,
      book,
      reviewText,
      rating,
    });

    const savedReview = await this.reviewRepository.save(review);
    this.logger.log(`Review created successfully: reviewId=${savedReview.id}`);

    // Invalidate the cache for book reviews to ensure the new review is included
    const cacheKey = `reviews:book:${bookId}`;
    await this.cacheService.del(cacheKey);

    return savedReview;
  }

  async getReviewsForBook(bookId: string): Promise<Review[]> {
    this.logger.log(`Fetching reviews for book ID ${bookId}`);
    const cacheKey = `reviews:book:${bookId}`;
    const cachedReviews = await this.cacheService.get(cacheKey);

    if (cachedReviews) {
      this.logger.log(`Found reviews for book ID ${bookId} in cache`);
      return JSON.parse(cachedReviews);
    }

    const reviews = await this.reviewRepository.find({
      where: { book: { id: bookId } },
      relations: ['user'],
    });

    await this.cacheService.set(cacheKey, JSON.stringify(reviews), 3600);
    this.logger.log(`Cached reviews for book ID ${bookId}`);

    return reviews;
  }
}
