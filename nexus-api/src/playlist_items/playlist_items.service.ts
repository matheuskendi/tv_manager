import { Injectable } from '@nestjs/common';
import { CreatePlaylistItemDto } from './dto/create-playlist_item.dto';
import { UpdatePlaylistItemDto } from './dto/update-playlist_item.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class PlaylistItemsService {
  constructor(private prisma: PrismaService) {}

  async create(createPlaylistItemDto: CreatePlaylistItemDto) {
    return await this.prisma.playlist_items.create({
      data: {
        playlist_id: createPlaylistItemDto.playlist_id,
        media_id: createPlaylistItemDto.media_id,
        display_order: createPlaylistItemDto.display_order,
      },
    });
  }

  async findAll() {
    return await this.prisma.playlist_items.findMany();
  }

  async findOne(id: string) {
    return await this.prisma.playlist_items.findUnique({
      where: { id },
    });
  }

  async update(id: string, updatePlaylistItemDto: UpdatePlaylistItemDto) {
    return await this.prisma.playlist_items.update({
      where: { id },
      data: updatePlaylistItemDto,
    });
  }

  async remove(id: string) {
    return await this.prisma.playlist_items.delete({
      where: { id },
    });
  }
}
