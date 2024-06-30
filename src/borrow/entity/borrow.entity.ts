import { User } from '../../user/entity/user.entity';

import { Entity, Column, ManyToOne } from 'typeorm';
import { Book } from '../../book/entity/book.entity';
import { BaseWithoutSoftDeleteEntity } from '../../common/entities/base-without-soft-delete';

@Entity()
export class Borrow extends BaseWithoutSoftDeleteEntity {
  @ManyToOne(() => User, (user) => user.borrows)
  user: User;

  @ManyToOne(() => Book, (book) => book.borrows)
  book: Book;

  @Column()
  borrowDate: Date;

  @Column()
  dueDate: Date;
}
