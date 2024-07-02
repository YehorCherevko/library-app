import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../user/entity/user.entity';
import { comparePasswords } from '../common/passport.util';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private readonly logger: LoggerService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    this.logger.log(`Validating user with email ${email}`);
    const user = await this.userService.findByEmail(email);

    if (user && (await comparePasswords(password, user.password))) {
      this.logger.log(`User validated with email ${email}`);
      return user;
    }

    this.logger.warn(`Invalid credentials for user with email ${email}`);
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(user: User) {
    const payload = { sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);

    this.logger.log(`User logged in with ID ${user.id}`);
    return {
      access_token: token,
    };
  }
}
