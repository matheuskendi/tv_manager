import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service'; // Ajuste o caminho se necessário
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: RegisterDto) {
    // 1. Verificar se o e-mail já existe na tabela admin_users
    const userExists = await this.prisma.admin_users.findUnique({
      where: { email: data.email },
    });

    if (userExists) {
      throw new ConflictException('Este e-mail já está cadastrado');
    }

    // 2. Criar o Hash da senha
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(data.password, salt);

    // 3. Salvar no banco usando os nomes exatos das colunas
    const user = await this.prisma.admin_users.create({
      data: {
        name: data.name,
        email: data.email,
        password_hash: hashedPassword, // Nome exato no seu schema
      },
    });

    // Remove a senha do objeto de retorno por segurança
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash: _, ...result } = user;
    return result;
  }

  async login(data: LoginDto) {
    // 1. Busca na tabela admin_users pelo e-mail
    const user = await this.prisma.admin_users.findUnique({
      where: { email: data.email },
    });

    // 2. Compara a senha do login com o password_hash do banco
    if (!user || !(await bcrypt.compare(data.password, user.password_hash))) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    // 3. O payload que vai dentro do Token
    // 'sub' é o padrão para o ID do sujeito (Matheus)
    const payload = { sub: user.id, email: user.email };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
}
