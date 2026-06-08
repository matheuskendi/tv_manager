import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateTvDeviceDto } from './dto/create-tv_device.dto';
import { UpdateTvDeviceDto } from './dto/update-tv_device.dto';
import { PrismaService } from 'src/database/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TvDevicesService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // 1. Recebe o adminId do Controller
  async create(createTvDeviceDto: CreateTvDeviceDto, adminId: string) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(
      createTvDeviceDto.password_hash,
      salt,
    );

    return await this.prisma.tv_devices.create({
      data: {
        id: createTvDeviceDto.id,
        name: createTvDeviceDto.name,
        password_hash: hashedPassword,
        playlist_id: createTvDeviceDto.playlist_id,
        admin_id: adminId, // Agora o adminId está definido!
      },
    });
  }

  // 2. Filtra para listar apenas as TVs do Matheus
  async findAll(adminId: string) {
    return await this.prisma.tv_devices.findMany({
      where: {
        admin_id: adminId,
      },
    });
  }

  // 3. Segurança: Só encontra a TV se ela pertencer ao admin logado
  async findOne(id: string) {
    return await this.prisma.tv_devices.findUnique({
      where: {
        id: id,
        // 🗑️ APAGUE a linha do admin_id aqui de dentro (se houver)!
      },
    });
  }

  // 4. UpdateMany para garantir que ninguém altere a TV de outro usuário
  async update(
    id: string,
    updateTvDeviceDto: UpdateTvDeviceDto,
    adminId: string,
  ) {
    return await this.prisma.tv_devices.updateMany({
      where: {
        id: id,
        admin_id: adminId,
      },
      data: updateTvDeviceDto,
    });
  }

  // 5. DeleteMany pelo mesmo motivo de segurança
  async remove(id: string, adminId: string) {
    return await this.prisma.tv_devices.deleteMany({
      where: {
        id: id,
        admin_id: adminId,
      },
    });
  }

  async login_devices(data: CreateTvDeviceDto) {
    const device = await this.prisma.tv_devices.findUnique({
      where: { name: data.name },
    });

    // 1. Verificamos se o dispositivo existe e se o campo password_hash existe
    // O TypeScript agora vai reconhecer 'password_hash' porque é o nome na sua tabela
    if (!device || !device.password_hash) {
      throw new UnauthorizedException('Dispositivo ou senha inválidos');
    }

    // 2. Compara a senha usando o nome correto da coluna: password_hash
    const isPasswordValid = await bcrypt.compare(
      data.password_hash,
      device.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Dispositivo ou senha inválidos');
    }

    const payload = {
      sub: device.id,
      name: device.name,
      adminId: device.admin_id,
    };

    return {
      access_token: this.jwtService.sign(payload),
      device: {
        id: device.id,
        name: device.name,
      },
    };
  }
}
