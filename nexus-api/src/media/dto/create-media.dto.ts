import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateMediaDto {
  @IsString({ message: 'O titulo da midia deve ser um texto valido' })
  @IsNotEmpty({ message: 'O titulo não pode estar vazio' })
  name: string;

  @IsString({ message: 'O tipo da playlist tem que ser selecionado' })
  @IsNotEmpty({ message: 'Esse espaço não pode estar vazio' })
  type: string;

  @IsString()
  @IsNotEmpty({ message: 'Obrigatorio colocar URL' })
  url: string;

  @IsInt()
  @IsNotEmpty({ message: 'Esse espaço não pode estar vazio' })
  duration: number;

  @IsString()
  @IsNotEmpty({ message: 'O ID do admin é obrigatório' })
  admin_id: string;
}
