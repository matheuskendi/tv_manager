import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt'; // <-- Importação crucial
import { JwtStrategy } from './jwt.strategy'; // Sua estratégia
import { PrismaModule } from 'src/database/prisma.module'; // Garanta que o PrismaModule está aqui

@Module({
  imports: [
    PrismaModule, // Garante que o PrismaService seja injetado
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'QW24Tbvz3DTGue', // Use .env!
      signOptions: { expiresIn: '24h' }, // O token dura 1 dia
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService], // Caso queira usar o service em outros módulos
})
export class AuthModule {}
