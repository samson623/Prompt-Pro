import { DatabaseStorage } from '../server/storage';

const mockUpdate = jest.fn(() => ({
  set: jest.fn().mockReturnThis(),
  where: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../server/db', () => ({
  __esModule: true,
  db: { update: (...args: any[]) => mockUpdate(...args) },
}));

describe('DatabaseStorage.incrementUserUsage', () => {
  const storage = new DatabaseStorage();

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('returns false when usage limit reached', async () => {
    jest.spyOn(storage, 'getUser').mockResolvedValueOnce({ id: '1', promptsUsed: 5, promptsLimit: 5 } as any);

    const result = await storage.incrementUserUsage('1');

    expect(result).toBe(false);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  test('increments usage when under limit', async () => {
    jest.spyOn(storage, 'getUser').mockResolvedValueOnce({ id: '1', promptsUsed: 1, promptsLimit: 5 } as any);

    const result = await storage.incrementUserUsage('1');

    expect(result).toBe(true);
    expect(mockUpdate).toHaveBeenCalled();
  });
});
