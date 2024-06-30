import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/common.entity';
import { Borrow } from '../../borrow/entity/borrow.entity';
import { Review } from '../../review/entity/review.entity';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @OneToMany(() => Borrow, (borrow) => borrow.user)
  borrows: Borrow[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];
}
