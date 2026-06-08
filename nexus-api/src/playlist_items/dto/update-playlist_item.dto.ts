import { PartialType } from '@nestjs/mapped-types';
import { CreatePlaylistItemDto } from './create-playlist_item.dto';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdatePlaylistItemDto extends PartialType(CreatePlaylistItemDto) {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaIds?: string[];
}
