import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'test',
    });
  }

  async validate(payload: { sub: number; email: string }) {
    const data = { id: payload.sub, email: payload.email };

    const user = await this.usersService.findById(data.id);

    if (!user) {
      throw new UnauthorizedException('Нет доступа к этой странице');
    }

    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      updateAt: user.updateAt,
    };
  }
}
