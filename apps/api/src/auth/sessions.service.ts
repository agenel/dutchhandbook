import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import argon2 from 'argon2';
import { randomBytes } from 'node:crypto';

const COOKIE_SID = 'mc_sid';
const COOKIE_REFRESH = 'mc_rt';
const COOKIE_CSRF = 'mc_csrf';

function randToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async createSession(userId: string, req: Request, res: Response): Promise<void> {
    const refresh = randToken(48);
    const refreshHash = await argon2.hash(refresh, { type: argon2.argon2id });
    const csrfSecret = randToken(24);

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const session = await this.prisma.session.create({
      data: {
        userId,
        refreshTokenHash: refreshHash,
        csrfSecret,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        expiresAt,
      },
    });

    const isProd = this.config.get<string>('NODE_ENV') === 'production';
    res.cookie(COOKIE_SID, session.id, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      signed: true,
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.cookie(COOKIE_REFRESH, refresh, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/api/v1/auth',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    this.issueCsrfCookie(res);
  }

  async getSessionFromRequest(req: Request): Promise<{ id: string; userId: string } | null> {
    const sid = String(req.signedCookies?.[COOKIE_SID] ?? '');
    if (!sid) return null;
    const session = await this.prisma.session.findUnique({ where: { id: sid } });
    if (!session) return null;
    if (session.revokedAt) return null;
    if (session.expiresAt.getTime() <= Date.now()) return null;
    await this.prisma.session.update({
      where: { id: session.id },
      data: { lastSeenAt: new Date() },
    });
    return { id: session.id, userId: session.userId };
  }

  async rotateRefresh(req: Request, res: Response): Promise<{ userId: string } | null> {
    const sid = String(req.signedCookies?.[COOKIE_SID] ?? '');
    const refresh = String(req.cookies?.[COOKIE_REFRESH] ?? '');
    if (!sid || !refresh) return null;
    const session = await this.prisma.session.findUnique({ where: { id: sid } });
    if (!session) return null;
    if (session.revokedAt) return null;
    if (session.expiresAt.getTime() <= Date.now()) return null;

    const ok = await argon2.verify(session.refreshTokenHash, refresh);
    if (!ok) return null;

    const nextRefresh = randToken(48);
    const nextHash = await argon2.hash(nextRefresh, { type: argon2.argon2id });

    await this.prisma.session.update({
      where: { id: sid },
      data: { refreshTokenHash: nextHash, lastSeenAt: new Date() },
    });

    const isProd = this.config.get<string>('NODE_ENV') === 'production';
    res.cookie(COOKIE_REFRESH, nextRefresh, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/api/v1/auth',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    this.issueCsrfCookie(res);
    return { userId: session.userId };
  }

  private issueCsrfCookie(res: Response): void {
    const isProd = this.config.get<string>('NODE_ENV') === 'production';
    const token = randToken(24);
    res.cookie(COOKIE_CSRF, token, {
      httpOnly: false,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }

  clearCookies(res: Response): void {
    const isProd = this.config.get<string>('NODE_ENV') === 'production';
    res.clearCookie(COOKIE_SID, { path: '/', signed: true });
    res.clearCookie(COOKIE_REFRESH, { path: '/api/v1/auth' });
    res.clearCookie('mc_csrf', { path: '/', secure: isProd, sameSite: 'strict' });
  }
}

