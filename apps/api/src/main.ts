import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  const config = app.get(ConfigService);
  const isProd = config.get<string>('NODE_ENV') === 'production';
  const allowedOrigins = (config.get<string>('CORS_ALLOWED_ORIGINS') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  app.use(cookieParser(config.getOrThrow<string>('COOKIE_SECRET')));

  app.use(
    helmet({
      contentSecurityPolicy: false, // CSP nonces are emitted by SSR
      hsts: isProd
        ? { maxAge: 63072000, includeSubDomains: true, preload: true }
        : false,
      crossOriginEmbedderPolicy: false,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );

  app.enableCors({
    origin: allowedOrigins.length ? allowedOrigins : (isProd ? false : true),
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  });

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  const port = Number(config.get<string>('PORT') ?? 3000);
  await app.listen(port);
}

bootstrap().catch((err) => {
  console.error('Failed to bootstrap API', err);
  process.exit(1);
});
