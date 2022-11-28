
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByCond({
      email,
      password,
    });
    if (user && user.password === password) {
      const { password, ...userData } = user;
      return userData;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    const { password, ...userData } = user;
    return {
      ...userData,
      token: this.jwtService.sign(payload),
    };
  }
}