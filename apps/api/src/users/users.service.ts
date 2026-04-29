import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { PublicUser } from '@moredutch/shared';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  toPublic(user: {
    id: string;
    email: string;
    displayName: string | null;
    emailVerified: boolean;
    hasTotp: boolean;
    createdAt: Date;
  }): PublicUser {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
      hasTotp: user.hasTotp,
      createdAt: user.createdAt.toISOString(),
    };
  }
}

