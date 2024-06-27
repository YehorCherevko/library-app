// src/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../user/entity/user.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    return this.authService.login(user);
  }

  @Post('register')
  async register(
    @Body() body: { name: string; email: string; password: string },
  ) {
    const user = await this.userService.create({
      ...body,
      password: await bcrypt.hash(body.password, 10),
    });
    return this.authService.login(user);
  }

  @Post('register-admin')
  async registerAdmin(
    @Body() body: { name: string; email: string; password: string },
  ) {
    const user = await this.userService.create({
      ...body,
      password: await bcrypt.hash(body.password, 10),
      role: UserRole.ADMIN,
    });
    return this.authService.login(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('me')
  getProfile(@Req() req: Request) {
    return req.user;
  }
}
