import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  name: string;

  @IsEmail({}, { message: 'E-mail invalido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'A senha deve ter no minimo 6 caracteres' })
  password_hash: string;
}
