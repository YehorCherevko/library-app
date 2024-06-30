import { Entity, Column, ManyToOne } from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { Book } from '../../book/entity/book.entity';
import { BaseWithoutSoftDeleteEntity } from '../../common/entities/base-without-soft-delete';

@Entity()
export class Review extends BaseWithoutSoftDeleteEntity {
  @ManyToOne(() => User, (user) => user.reviews)
  user: User;

  @ManyToOne(() => Book, (book) => book.reviews)
  book: Book;

  @Column('text')
  reviewText: string;

  @Column('int')
  rating: number;
}
