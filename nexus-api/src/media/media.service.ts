import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { PrismaService } from 'src/database/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}

  // 🚀 Cria a mídia com a URL local já gerada pelo Controller
  async create(createMediaDto: CreateMediaDto, adminId: string) {
    return await this.prisma.medias.create({
      data: {
        name: createMediaDto.name,
        type: createMediaDto.type,
        url: createMediaDto.url,
        duration: createMediaDto.duration ?? 10, // Fallback para 10s se for imagem
        admin_id: adminId,
      },
    });
  }

  // 📂 Lista todas as mídias do Admin logado
  async findAll(adminId: string) {
    return await this.prisma.medias.findMany({
      where: { admin_id: adminId },
      orderBy: { created_at: 'desc' },
    });
  }

  // 🔓 Usado pela TV e pelo Admin (Busca por ID único)
  async findOne(id: string) {
    const media = await this.prisma.medias.findUnique({
      where: { id },
    });

    if (!media) throw new NotFoundException('Mídia não encontrada');
    return media;
  }

  // 📝 Atualiza garantindo que a mídia pertence ao Admin
  async update(id: string, updateMediaDto: UpdateMediaDto, adminId: string) {
    // Usamos updateMany por segurança, mas ele retorna apenas o número de afetados
    const affected = await this.prisma.medias.updateMany({
      where: {
        id,
        admin_id: adminId,
      },
      data: updateMediaDto,
    });

    if (affected.count === 0)
      throw new NotFoundException('Mídia não encontrada ou sem permissão');
    return affected;
  }

  // 🗑️ Remove garantindo a posse do arquivo e limpando o HD local
  async remove(id: string, adminId: string) {
    // 1. Busca a mídia primeiro para garantir que existe E pertence ao admin
    const media = await this.prisma.medias.findFirst({
      where: {
        id,
        admin_id: adminId,
      },
    });

    // Se não achar (ou não for dono), bloqueia na hora com a sua exceção
    if (!media) {
      throw new NotFoundException('Mídia não encontrada ou sem permissão');
    }

    // 2. Isola o nome do arquivo da URL e tenta apagar fisicamente
    if (media.url) {
      const urlParts = media.url.split('/');
      const filename = urlParts[urlParts.length - 1];
      const filePath = path.join(process.cwd(), 'uploads', filename);

      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath); // Limpa o arquivo da pasta uploads
        }
      } catch (error) {
        console.error(`Falha ao apagar arquivo físico: ${filePath}`, error);
      }
    }

    // 3. Executa o seu comando original para limpar do banco
    const affected = await this.prisma.medias.deleteMany({
      where: {
        id,
        admin_id: adminId,
      },
    });

    return affected;
  }
}
