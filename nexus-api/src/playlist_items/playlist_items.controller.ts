import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PlaylistItemsService } from './playlist_items.service';
import { CreatePlaylistItemDto } from './dto/create-playlist_item.dto';
import { UpdatePlaylistItemDto } from './dto/update-playlist_item.dto';

@Controller('playlist-items')
export class PlaylistItemsController {
  constructor(private readonly playlistItemsService: PlaylistItemsService) {}

  @Post()
  create(@Body() createPlaylistItemDto: CreatePlaylistItemDto) {
    return this.playlistItemsService.create(createPlaylistItemDto);
  }

  @Get()
  findAll() {
    return this.playlistItemsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.playlistItemsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePlaylistItemDto: UpdatePlaylistItemDto,
  ) {
    return this.playlistItemsService.update(id, updatePlaylistItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.playlistItemsService.remove(id);
  }
}
