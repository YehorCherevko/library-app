import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { hashPassword } from '../common/passport.util';
import { LoggerService } from '../logger/logger.service';
import { RedisCacheService } from '../redis/redis-cache.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly logger: LoggerService,
    private readonly cacheService: RedisCacheService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log('Creating a new user');
    const hashedPassword = await hashPassword(createUserDto.password);
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    const savedUser = await this.usersRepository.save(user);

    this.logger.log(`New user created with ID ${savedUser.id}`);
    return savedUser;
  }

  async findAll(): Promise<User[]> {
    this.logger.log('Fetching all users');
    const cacheKey = 'users:all';
    const cachedUsers = await this.cacheService.get(cacheKey);

    if (cachedUsers) {
      this.logger.log('Found all users in cache');
      return JSON.parse(cachedUsers);
    }

    const users = await this.usersRepository.find({
      where: { deleted_at: null },
    });
    await this.cacheService.set(cacheKey, JSON.stringify(users), 3600);
    this.logger.log('Cached all users');
    return users;
  }

  async findOne(id: string): Promise<User> {
    this.logger.log(`Fetching user with ID ${id}`);
    const cacheKey = `user:${id}`;
    const cachedUser = await this.cacheService.get(cacheKey);

    if (cachedUser) {
      this.logger.log(`Found user with ID ${id} in cache`);
      return JSON.parse(cachedUser);
    }

    const user = await this.usersRepository.findOne({
      where: { id, deleted_at: null },
    });

    if (!user) {
      this.logger.warn(`User with ID ${id} not found`);
      throw new NotFoundException('User not found');
    }

    await this.cacheService.set(cacheKey, JSON.stringify(user), 3600);
    this.logger.log(`Cached user with ID ${id}`);
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    this.logger.log(`Updating user with ID ${id}`);
    const user = await this.usersRepository.preload({
      id,
      ...updateUserDto,
    });

    if (!user || user.deleted_at !== null) {
      this.logger.warn(`User with ID ${id} not found or has been deleted`);
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.password) {
      user.password = await hashPassword(updateUserDto.password);
    }

    const updatedUser = await this.usersRepository.save(user);
    await this.cacheService.del(`user:${id}`);
    this.logger.log(`Updated user with ID ${id}`);
    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Removing user with ID ${id}`);
    const user = await this.findOne(id);
    if (!user) {
      this.logger.warn(`User with ID ${id} not found`);
      throw new NotFoundException('User not found');
    }

    await this.usersRepository.softRemove(user);
    await this.cacheService.del(`user:${id}`);
    this.logger.log(`Removed user with ID ${id}`);
  }

  async findByEmail(email: string): Promise<User> {
    this.logger.log(`Fetching user with email ${email}`);
    const user = await this.usersRepository.findOne({
      where: { email, deleted_at: null },
    });
    if (!user) {
      this.logger.warn(`User with email ${email} not found`);
    }
    return user;
  }
}
