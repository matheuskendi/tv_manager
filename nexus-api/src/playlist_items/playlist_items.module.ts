import { Module } from '@nestjs/common';
import { PlaylistItemsService } from './playlist_items.service';
import { PlaylistItemsController } from './playlist_items.controller';
import { PrismaModule } from 'src/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PlaylistItemsController],
  providers: [PlaylistItemsService],
})
export class PlaylistItemsModule {}
