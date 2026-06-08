import { IsNotEmpty, IsString } from 'class-validator';

export class LoginTvDevicesDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
