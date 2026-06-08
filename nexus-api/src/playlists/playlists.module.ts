import { Module } from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { PlaylistsController } from './playlists.controller';
import { PrismaModule } from '../database/prisma.module';
import { TvGateway } from '../gateways/tv.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [PlaylistsController],
  providers: [PlaylistsService, TvGateway],
})
export class PlaylistsModule {}
