import { Test } from '@nestjs/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('HealthController', () => {
  async function build(queryRaw: () => Promise<unknown>) {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: PrismaService, useValue: { $queryRaw: queryRaw } }],
    }).compile();
    return moduleRef.get(HealthController);
  }

  it('returns ok when the DB responds', async () => {
    const ctrl = await build(() => Promise.resolve([{ '?column?': 1 }]));
    await expect(ctrl.ok()).resolves.toEqual({ ok: true, db: true });
  });

  it('throws ServiceUnavailable when the DB is down', async () => {
    const ctrl = await build(() => Promise.reject(new Error('connection refused')));
    await expect(ctrl.ok()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
