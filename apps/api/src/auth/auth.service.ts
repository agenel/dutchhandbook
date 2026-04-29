import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Request, Response } from 'express';
import argon2 from 'argon2';
import { randomBytes } from 'node:crypto';
import type { LoginDto, RegisterDto, PublicUser } from '@moredutch/shared';
import { SessionsService } from './sessions.service';

const COOKIE_SID = 'mc_sid';
const COOKIE_CSRF = 'mc_csrf';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function randToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessions: SessionsService,
    private readonly config: ConfigService,
  ) {}

  async requireUser(req: Request): Promise<PublicUser> {
    const session = await this.sessions.getSessionFromRequest(req);
    if (!session) throw new UnauthorizedException();
    const user = await this.prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) throw new UnauthorizedException();
    return this.toPublic(user);
  }

  async register(dto: RegisterDto, req: Request, res: Response): Promise<{ user: PublicUser }> {
    const email = normalizeEmail(dto.email);
    const exists = await this.prisma.user.findFirst({ where: { emailNormalized: email } });
    if (exists) throw new BadRequestException({ message: 'Email already registered' });

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });

    const user = await this.prisma.user.create({
      data: {
        email,
        emailNormalized: email,
        passwordHash,
        displayName: dto.displayName ?? null,
      },
    });

    // Email verification token (logged for now until SMTP is wired).
    const verifyToken = randToken(32);
    const verifyHash = await argon2.hash(verifyToken, { type: argon2.argon2id });
    await this.prisma.emailToken.create({
      data: {
        userId: user.id,
        purpose: 'VERIFY',
        tokenHash: verifyHash,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    // eslint-disable-next-line no-console
    console.log(`[verify-email] email=${email} token=${verifyToken}`);

    await this.sessions.createSession(user.id, req, res);
    return { user: this.toPublic(user) };
  }

  async login(dto: LoginDto, req: Request, res: Response): Promise<{ user: PublicUser }> {
    const email = normalizeEmail(dto.email);
    const user = await this.prisma.user.findFirst({ where: { emailNormalized: email } });
    // Generic error message for enumeration resistance.
    if (!user) throw new UnauthorizedException({ message: 'Invalid email or password' });

    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      throw new ForbiddenException({ message: 'Account temporarily locked' });
    }

    const ok = await argon2.verify(user.passwordHash, dto.password);
    if (!ok) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLogins: { increment: 1 },
          lockedUntil:
            user.failedLogins + 1 >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : user.lockedUntil,
        },
      });
      throw new UnauthorizedException({ message: 'Invalid email or password' });
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { failedLogins: 0, lockedUntil: null, lastLoginAt: new Date(), lastLoginIp: req.ip },
    });

    await this.sessions.createSession(user.id, req, res);
    return { user: this.toPublic(user) };
  }

  async logout(req: Request, res: Response): Promise<void> {
    const sid = String(req.signedCookies?.[COOKIE_SID] ?? '');
    if (sid) {
      await this.prisma.session.updateMany({ where: { id: sid }, data: { revokedAt: new Date() } });
    }
    this.sessions.clearCookies(res);
  }

  async refresh(req: Request, res: Response): Promise<PublicUser | null> {
    const rotated = await this.sessions.rotateRefresh(req, res);
    if (!rotated) return null;
    const user = await this.prisma.user.findUnique({ where: { id: rotated.userId } });
    if (!user) return null;
    return this.toPublic(user);
  }

  async requestPasswordReset(email: string, req: Request): Promise<void> {
    const user = await this.prisma.user.findFirst({ where: { emailNormalized: email } });
    if (!user) return;

    const token = randToken(32);
    const tokenHash = await argon2.hash(token, { type: argon2.argon2id });

    await this.prisma.emailToken.create({
      data: {
        userId: user.id,
        purpose: 'PASSWORD_RESET',
        tokenHash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    // TODO: send email. For now log token in server logs only.
    // This is safe for local dev; production should wire SMTP before enabling.
    // eslint-disable-next-line no-console
    console.log(`[password-reset] email=${email} token=${token} ip=${req.ip}`);
  }

  async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    const candidates = await this.prisma.emailToken.findMany({
      where: { purpose: 'PASSWORD_RESET', usedAt: null, expiresAt: { gt: new Date() } },
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });

    for (const t of candidates) {
      const ok = await argon2.verify(t.tokenHash, token);
      if (!ok) continue;
      const passwordHash = await argon2.hash(newPassword, { type: argon2.argon2id });
      await this.prisma.$transaction([
        this.prisma.user.update({ where: { id: t.userId }, data: { passwordHash } }),
        this.prisma.emailToken.update({ where: { id: t.id }, data: { usedAt: new Date() } }),
        this.prisma.session.updateMany({ where: { userId: t.userId }, data: { revokedAt: new Date() } }),
      ]);
      return;
    }

    throw new UnauthorizedException({ message: 'Invalid or expired token' });
  }

  async verifyEmail(token: string): Promise<void> {
    const candidates = await this.prisma.emailToken.findMany({
      where: { purpose: 'VERIFY', usedAt: null, expiresAt: { gt: new Date() } },
      take: 50,
      orderBy: { createdAt: 'desc' },
    });
    for (const t of candidates) {
      const ok = await argon2.verify(t.tokenHash, token);
      if (!ok) continue;
      await this.prisma.$transaction([
        this.prisma.user.update({ where: { id: t.userId }, data: { emailVerified: true } }),
        this.prisma.emailToken.update({ where: { id: t.id }, data: { usedAt: new Date() } }),
      ]);
      return;
    }
    throw new UnauthorizedException({ message: 'Invalid or expired token' });
  }

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

  cookieOptions() {
    const isProd = this.config.get<string>('NODE_ENV') === 'production';
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict' as const,
      path: '/',
    };
  }

  csrfCookieOptions() {
    const isProd = this.config.get<string>('NODE_ENV') === 'production';
    return {
      httpOnly: false,
      secure: isProd,
      sameSite: 'strict' as const,
      path: '/',
    };
  }

  issueCsrfCookie(res: Response): void {
    const token = randToken(24);
    res.cookie(COOKIE_CSRF, token, this.csrfCookieOptions());
  }
}

