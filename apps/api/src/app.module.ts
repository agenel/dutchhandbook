import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule } from './auth/auth.module';
import { GlobalExceptionFilter } from './common/global-exception.filter';
import { CsrfGuard } from './common/csrf.guard';
import { ContentModule } from './content/content.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProgressModule } from './progress/progress.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      // Resolve .env paths based on compiled output location:
      //   __dirname = apps/api/dist/src  (NestJS compiles into dist/src/)
      //   '../..'  = apps/api/              → loads apps/api/.env  (highest priority)
      //   '../../..' = apps/api/../../../  → no, need '../../../...' = monorepo root
      //   apps/api/dist/src → ../../.. → apps/ → need one more → monorepo root
      envFilePath: [
        path.resolve(__dirname, '..', '..', '.env'),          // apps/api/.env  (highest priority)
        path.resolve(__dirname, '..', '..', '..', '..', '.env'), // monorepo root .env (fallback)
      ],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env['NODE_ENV'] === 'production' ? 'info' : 'debug',
        transport:
          process.env['NODE_ENV'] === 'production'
            ? undefined
            : { target: 'pino-pretty', options: { singleLine: true } },
        // Drop password / token / cookie / authorization values from logs.
        redact: {
          paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'req.body.password',
            'req.body.currentPassword',
            'req.body.newPassword',
            'req.body.token',
            'req.body.totp',
            'res.headers["set-cookie"]',
          ],
          censor: '[REDACTED]',
        },
        customLogLevel: (_req, res, err) => {
          if (err || res.statusCode >= 500) return 'error';
          if (res.statusCode >= 400) return 'warn';
          return 'info';
        },
      },
    }),
    ThrottlerModule.forRoot([
      // Two-layer rate limit: a fast burst limiter and a slower hard ceiling.
      { name: 'short', ttl: 1000, limit: 10 },
      { name: 'medium', ttl: 10_000, limit: 50 },
      { name: 'long', ttl: 60_000, limit: 200 },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProgressModule,
    ContentModule,
    HealthModule,
    AdminModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: CsrfGuard },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class AppModule {}
