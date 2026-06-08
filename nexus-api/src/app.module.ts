import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosService } from './usuarios/usuarios.service';
import { UsuariosModule } from './usuarios/usuarios.module';
import { PrismaModule } from './database/prisma.module';
import { MediaModule } from './media/media.module';
import { PlaylistsModule } from './playlists/playlists.module';
import { TvDevicesModule } from './tv_devices/tv_devices.module';
import { PlaylistItemsModule } from './playlist_items/playlist_items.module';
import { AuthModule } from './auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    PrismaModule,
    UsuariosModule,
    MediaModule,
    PlaylistsModule,
    TvDevicesModule,
    PlaylistItemsModule,
    AuthModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // 👈 Caminho da pasta
      serveRoot: '/uploads', // 👈 Prefixo da URL
    }),
  ],
  controllers: [AppController],
  providers: [AppService, UsuariosService],
})
export class AppModule {}
