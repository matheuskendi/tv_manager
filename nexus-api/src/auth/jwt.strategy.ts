import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common'; // Adicionado UnauthorizedException
import { PrismaService } from 'src/database/prisma.service'; // Importação do seu serviço de banco

// 1. Definindo a interface do Payload para o TS parar de reclamar do .sub
interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    // 2. Injetando o Prisma aqui
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'QW24Tbvz3DTGue',
    });
  }

  async validate(payload: JwtPayload) {
    // 3. Agora o TS sabe o que é 'payload.sub'
    const user = await this.prisma.admin_users.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado ou inativo');
    }

    // O que retorna aqui vira o 'req.user'
    return { id: user.id, email: user.email };
  }
}
