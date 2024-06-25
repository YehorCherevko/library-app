import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Author } from '../../author/entity/author.entity'; // Adjust the import path as necessary
import { BaseEntity } from '../../common/entities/common.entity';

@Entity()
export class Book extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @ManyToOne(() => Author, (author) => author.books)
  author: Author;

  @Column({ type: 'varchar', length: 20 })
  deweyDecimalClassification: string;
}
