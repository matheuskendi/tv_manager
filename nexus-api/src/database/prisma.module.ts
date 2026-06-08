import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // <--- O segredo para não precisar importar em todo lugar
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // <--- ESSENCIAL: Sem isso, ninguém fora daqui pode usar o PrismaService
})
export class PrismaModule {}
