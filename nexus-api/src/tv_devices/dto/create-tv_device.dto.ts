import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateTvDeviceDto {
  // 1. Libera a entrada do ID manual que vem do React
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  // 2. Continua exigindo a senha
  @IsString()
  @IsNotEmpty()
  password_hash: string;

  // 3. Torna a playlist OPCIONAL na hora de criar a TV
  @IsString()
  @IsOptional()
  playlist_id?: string;

  @IsString()
  @IsNotEmpty()
  admin_id: string;
}
