import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { Author } from '../../author/entity/author.entity'; // Adjust the import path as necessary
import { BaseEntity } from '../../common/entities/common.entity';
import { Borrow } from '../../borrow/entity/borrow.entity';
import { Review } from '../../review/entity/review.entity';

@Entity()
export class Book extends BaseEntity {
  @Column()
  title: string;

  @ManyToOne(() => Author, (author) => author.books)
  author: Author;

  @Column({ type: 'varchar', length: 20 })
  deweyDecimalClassification: string;

  @OneToMany(() => Borrow, (borrow) => borrow.book)
  borrows: Borrow[];

  @OneToMany(() => Review, (review) => review.book)
  reviews: Review[];
}
