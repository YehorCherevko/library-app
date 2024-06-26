import { Entity, Column, OneToMany } from 'typeorm';
import { Book } from '../../book/entity/book.entity';
import { BaseEntity } from '../../common/entities/common.entity';

@Entity()
export class Author extends BaseEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @OneToMany(() => Book, (book) => book.author)
  books: Book[];
}
