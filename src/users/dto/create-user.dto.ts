import { IsEmail, Length } from 'class-validator';

export class CreateUserDto {
  @Length(3)
  name: string;

  @IsEmail(undefined, { message: 'Неверная почта' })
  email: string;

  @Length(6, 32, { message: 'Пароль должен состоять минимум из 6 символов' })
  password: string;
}
