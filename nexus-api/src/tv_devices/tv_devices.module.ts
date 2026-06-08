import { Module } from '@nestjs/common';
import { TvDevicesService } from './tv_devices.service';
import { TvDevicesController } from './tv_devices.controller';
import { PrismaModule } from 'src/database/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'sua_chave_secreta', // Use a mesma chave do seu AuthModule
      signOptions: { expiresIn: '7d' }, // Tempo de expiração do token da TV
    }),
  ],
  controllers: [TvDevicesController],
  providers: [TvDevicesService],
})
export class TvDevicesModule {}
