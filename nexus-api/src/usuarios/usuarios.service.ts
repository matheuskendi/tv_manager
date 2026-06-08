import { Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PrismaService } from '../database/prisma.service'; // Verifique se o caminho está certo (pode ser 'src/prisma/prisma.service')

@Injectable()
export class UsuariosService {
  // 1. O Construtor injeta o Prisma
  constructor(private prisma: PrismaService) {}

  // 2. A função CREATE
  async create(createUsuarioDto: CreateUsuarioDto) {
    return await this.prisma.admin_users.create({
      data: {
        // LADO ESQUERDO: Nome da coluna no banco (schema.prisma)
        // LADO DIREITO: Nome do campo no DTO (JSON)

        name: createUsuarioDto.name,
        email: createUsuarioDto.email,

        // Aqui acontece a mágica da tradução:
        password_hash: createUsuarioDto.password_hash,
      },
    });
  }

  // 3. A função FIND ALL
  async findAll() {
    return await this.prisma.admin_users.findMany();
  }

  // 4. A função FIND ONE
  async findOne(id: string) {
    return await this.prisma.admin_users.findUnique({
      where: { id },
    });
  }

  // 5. A função UPDATE
  async update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    return await this.prisma.admin_users.update({
      where: { id },
      data: updateUsuarioDto,
    });
  }

  // 6. A função REMOVE
  async remove(id: string) {
    return await this.prisma.admin_users.delete({
      where: { id },
    });
  }
}
