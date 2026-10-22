import { BadRequestException } from '@nestjs/common';
import argon2 from 'argon2';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';

const req = { ip: '203.0.113.1', get: () => 'jest' } as unknown as Request;
const res = {} as Response;

async function setup(opts: { session?: { id: string; userId: string } | null; password?: string } = {}) {
  const password = opts.password ?? 'Correct-horse1!';
  const user = {
    id: 'u1',
    email: 'a@example.test',
    displayName: 'Ann',
    emailVerified: true,
    hasTotp: false,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    isAdmin: false,
    isBanned: false,
    passwordHash: await argon2.hash(password, { type: argon2.argon2id }),
  };
  const prisma = {
    user: {
      findUnique: jest.fn().mockResolvedValue(user),
      update: jest.fn().mockImplementation(async ({ data }) => ({ ...user, ...data })),
      delete: jest.fn().mockResolvedValue(user),
    },
    session: { update: jest.fn(), updateMany: jest.fn().mockResolvedValue({ count: 2 }) },
    $transaction: jest.fn(async (ops: Promise<unknown>[]) => Promise.all(ops)),
  };
  const sessions = {
    getSessionFromRequest: jest
      .fn()
      .mockResolvedValue(opts.session === undefined ? { id: 's-current', userId: 'u1' } : opts.session),
    clearCookies: jest.fn(),
  };
  const audit = { logEvent: jest.fn() };
  const config = { get: jest.fn() };
  const service = new AuthService(prisma as never, sessions as never, config as never, audit as never, {} as never);
  return { service, prisma, sessions, audit, user, password };
}

describe('AuthService account self-service', () => {
  it('currentUser returns null for anonymous visitors instead of throwing', async () => {
    const { service } = await setup({ session: null });
    await expect(service.currentUser(req)).resolves.toBeNull();
  });

  it('currentUser returns the public user for a valid session', async () => {
    const { service } = await setup();
    await expect(service.currentUser(req)).resolves.toMatchObject({ id: 'u1', email: 'a@example.test' });
  });

  it('changePassword rejects a wrong current password and audits it', async () => {
    const { service, prisma, audit } = await setup();
    await expect(
      service.changePassword(req, { currentPassword: 'wrong', newPassword: 'New-pass1!' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(audit.logEvent).toHaveBeenCalledWith('u1', 'PASSWORD_CHANGE_FAILED', req, undefined);
  });

  it('changePassword rejects reusing the same password', async () => {
    const { service, password } = await setup();
    await expect(
      service.changePassword(req, { currentPassword: password, newPassword: password }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('changePassword stores a new hash and signs out other sessions only', async () => {
    const { service, prisma, password } = await setup();
    await service.changePassword(req, { currentPassword: password, newPassword: 'Brand-new9!' });
    const newHash = prisma.user.update.mock.calls[0][0].data.passwordHash as string;
    await expect(argon2.verify(newHash, 'Brand-new9!')).resolves.toBe(true);
    expect(prisma.session.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'u1', id: { not: 's-current' }, revokedAt: null } }),
    );
  });

  it('updateProfile clears the name when given null', async () => {
    const { service, prisma } = await setup();
    const out = await service.updateProfile(req, { displayName: null });
    expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: 'u1' }, data: { displayName: null } });
    expect(out.displayName).toBeNull();
  });

  it('deleteAccount refuses a wrong password and keeps the account', async () => {
    const { service, prisma } = await setup();
    await expect(service.deleteAccount(req, res, { password: 'nope' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });

  it('deleteAccount deletes the user, audits, and clears cookies', async () => {
    const { service, prisma, sessions, audit, password } = await setup();
    await service.deleteAccount(req, res, { password });
    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'u1' } });
    expect(sessions.clearCookies).toHaveBeenCalledWith(res);
    expect(audit.logEvent).toHaveBeenCalledWith('u1', 'ACCOUNT_DELETED', req, { deletedUserId: 'u1' });
  });
});
