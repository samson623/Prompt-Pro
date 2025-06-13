import request from 'supertest';
import express from 'express';

const mockGetUser = jest.fn();
const mockCreateQuestionnaire = jest.fn();
const mockUpdateQuestionnaire = jest.fn();

jest.mock('../server/storage', () => ({
  __esModule: true,
  storage: {
    getUser: (...args: any[]) => mockGetUser(...args),
    createQuestionnaire: (...args: any[]) => mockCreateQuestionnaire(...args),
    updateQuestionnaire: (...args: any[]) => mockUpdateQuestionnaire(...args),
  }
}));

jest.mock('../server/replitAuth', () => ({
  __esModule: true,
  setupAuth: jest.fn().mockResolvedValue(undefined),
  isAuthenticated: (_req: any, _res: any, next: any) => {
    (_req as any).user = { claims: { sub: 'user1' } };
    next();
  }
}));

describe('registerRoutes', () => {
  beforeEach(() => {
    process.env.OPENROUTER_API_KEY = '';
    jest.resetModules();
  });

  test('GET /api/auth/user returns user data', async () => {
    mockGetUser.mockResolvedValueOnce({ id: 'user1' });

    const { registerRoutes } = await import('../server/routes');
    const app = express();
    app.use(express.json());
    await registerRoutes(app);

    const res = await request(app).get('/api/auth/user');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 'user1' });
  });

  test('POST /api/generate-questions uses fallback without API key', async () => {
    mockCreateQuestionnaire.mockResolvedValueOnce({ id: 'q1' });
    mockUpdateQuestionnaire.mockResolvedValueOnce(undefined);
    mockGetUser.mockResolvedValueOnce({ id: 'user1' });

    const { registerRoutes } = await import('../server/routes');
    const app = express();
    app.use(express.json());
    await registerRoutes(app);

    const res = await request(app)
      .post('/api/generate-questions')
      .send({ originalPrompt: 'Test', enhancementOptions: {} });

    expect(res.status).toBe(200);
    expect(res.body.questions.length).toBeGreaterThan(0);
    expect(mockCreateQuestionnaire).toHaveBeenCalled();
    expect(mockUpdateQuestionnaire).toHaveBeenCalled();
  });
});
