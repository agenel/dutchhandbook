import { Test, TestingModule } from '@nestjs/testing';
import { ProgressService } from './progress.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProgressService preferences', () => {
  let service: ProgressService;
  const prisma = {
    userPreference: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(ProgressService);
    jest.clearAllMocks();
  });

  it('getPreferences returns defaults when missing', async () => {
    prisma.userPreference.findUnique.mockResolvedValue(null);
    const prefs = await service.getPreferences('user-1');
    expect(prefs).toEqual({
      darkMode: false,
      flashcardMode: false,
      hideMastered: false,
    });
  });

  it('patchPreferences upserts partial fields', async () => {
    prisma.userPreference.upsert.mockResolvedValue({});
    await service.patchPreferences('user-1', { darkMode: true });
    expect(prisma.userPreference.upsert).toHaveBeenCalled();
    const arg = prisma.userPreference.upsert.mock.calls[0][0] as {
      where: { userId: string };
      update: { darkMode?: boolean };
    };
    expect(arg.where).toEqual({ userId: 'user-1' });
    expect(arg.update).toEqual({ darkMode: true });
  });
});
