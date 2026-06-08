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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

// 1. Interfaces para tipar os arquivos e calar o ESLint
interface MulterFileBase {
  originalname: string;
  mimetype: string;
}

interface SavedFile {
  filename: string;
  mimetype: string;
  originalname: string;
}

interface RequestWithUser extends Request {
  user: { id: string };
}

// 2. Isolamos a configuração do Multer para não conflitar com a classe
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
const multerConfig = {
  storage: diskStorage({
    destination: './uploads',
    filename: (
      req: Request,
      file: MulterFileBase,
      cb: (error: Error | null, filename: string) => void,
    ) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const extension = extname(file.originalname);
      cb(null, `${uniqueSuffix}${extension}`);
    },
  }),
};
/* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

// 3. O Controller
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  uploadFile(@UploadedFile() file: SavedFile) {
    if (!file) {
      throw new Error('Arquivo não encontrado.');
    }

    const fileUrl = `http://172.16.0.34:3000/uploads/${file.filename}`;
    const isVideo = file.mimetype.includes('video');

    return {
      url: fileUrl,
      type: isVideo ? 'video' : 'image',
      name: file.originalname,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createMediaDto: CreateMediaDto,
    @Req() req: RequestWithUser,
  ) {
    return await this.mediaService.create(createMediaDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req: RequestWithUser) {
    return await this.mediaService.findAll(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.mediaService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMediaDto: UpdateMediaDto,
    @Req() req: RequestWithUser,
  ) {
    return await this.mediaService.update(id, updateMediaDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return await this.mediaService.remove(id, req.user.id);
  }
}
