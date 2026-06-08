import { PartialType } from '@nestjs/mapped-types';
import { CreatePlaylistDto } from './create-playlist.dto';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdatePlaylistDto extends PartialType(CreatePlaylistDto) {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaIds?: string[];
}
