import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TvDevicesService } from './tv_devices.service';
import { CreateTvDeviceDto } from './dto/create-tv_device.dto';
import { UpdateTvDeviceDto } from './dto/update-tv_device.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

// Interface que ensina o TypeScript o que tem dentro do Token
interface RequestWithUser extends Request {
  user: {
    id: string;
  };
}

// ❌ ATENÇÃO: Tirei o @UseGuards daqui de cima! A porta de entrada do prédio está aberta.
@Controller('tv-devices')
export class TvDevicesController {
  constructor(private readonly tvDevicesService: TvDevicesService) {}

  // 👇 1. A NOVA ROTA DE LOGIN (Totalmente pública, sem cadeado!)
  @Post('login')
  async login(@Body() loginData: any) {
    // 👈 Mudamos aqui! Sem DTO, sem bloqueio.
    return await this.tvDevicesService.login_devices(loginData);
  }

  // 👇 2. AS ROTAS PROTEGIDAS (Cada uma ganhou seu próprio cadeado agora)

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createTvDeviceDto: CreateTvDeviceDto,
    @Req() req: RequestWithUser,
  ) {
    return await this.tvDevicesService.create(createTvDeviceDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req: RequestWithUser) {
    return await this.tvDevicesService.findAll(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.tvDevicesService.findOne(id); // Removido o req.user.id
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTvDeviceDto: UpdateTvDeviceDto,
    @Req() req: RequestWithUser,
  ) {
    return await this.tvDevicesService.update(
      id,
      updateTvDeviceDto,
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return await this.tvDevicesService.remove(id, req.user.id);
  }
}
