import { IsNumber, IsString } from 'class-validator';

export class CreatePlaylistItemDto {
  @IsString()
  playlist_id: string;

  @IsString()
  media_id: string;

  @IsNumber()
  display_order: number;
}
