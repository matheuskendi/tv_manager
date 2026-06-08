import { Injectable } from '@nestjs/common';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { PrismaService } from 'src/database/prisma.service';
import { TvGateway } from '../gateways/tv.gateway';
import { playlists } from '@prisma/client'; // 👈 Importante para a tipagem correta

@Injectable()
export class PlaylistsService {
  constructor(
    private prisma: PrismaService,
    private tvGateway: TvGateway,
  ) {}

  async create(createPlaylistDto: CreatePlaylistDto) {
    return await this.prisma.playlists.create({
      data: {
        id: createPlaylistDto.id,
        name: createPlaylistDto.name,
        created_by: createPlaylistDto.created_by,
      },
    });
  }

  async findAll(created_by: string) {
    return await this.prisma.playlists.findMany({
      where: { created_by },
      include: {
        playlist_items: true,
      },
    });
  }

  async findOne(id: string) {
    return await this.prisma.playlists.findUnique({
      where: { id: id },
      include: { playlist_items: true },
    });
  }

  async update(
    id: string,
    updatePlaylistDto: UpdatePlaylistDto,
  ): Promise<playlists | null> {
    const { mediaIds, ...restData } = updatePlaylistDto;

    // 1. Sincronização de Itens da Playlist (Tabela Pivô)
    if (mediaIds !== undefined) {
      await this.prisma.playlist_items.deleteMany({
        where: { playlist_id: id },
      });

      if (mediaIds.length > 0) {
        const itensParaInserir = mediaIds.map(
          (media_id: string, index: number) => ({
            playlist_id: id,
            media_id: media_id,
            display_order: index,
          }),
        );

        await this.prisma.playlist_items.createMany({
          data: itensParaInserir,
        });
      }
    }

    // 2. Atualização dos dados da Playlist (Nome, etc)
    // Definimos o tipo explicitamente para evitar erro de 'any' no return
    let updatedPlaylist: playlists | null = null;

    if (Object.keys(restData).length > 0) {
      updatedPlaylist = await this.prisma.playlists.update({
        where: { id },
        data: restData,
      });
    } else {
      updatedPlaylist = await this.prisma.playlists.findUnique({
        where: { id },
      });
    }

    // 🔥 3. NOTIFICAÇÃO EM TEMPO REAL 🔥
    // Buscamos as TVs vinculadas para avisar que o conteúdo mudou
    const linkedDevices = await this.prisma.tv_devices.findMany({
      where: { playlist_id: id },
      select: { id: true },
    });

    linkedDevices.forEach((device) => {
      // Usamos o ignore para o ESLint não reclamar da chamada do Socket.io
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      (this.tvGateway.server as any)?.emit('update_tv', { tvId: device.id });
      console.log(`📡 Sinal enviado para a TV: ${device.id}`);
    });

    return updatedPlaylist;
  }

  async remove(id: string) {
    return await this.prisma.playlists.delete({
      where: { id },
    });
  }
}
