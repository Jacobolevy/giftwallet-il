import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
  Language: { he: 'he', en: 'en' },
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn(async () => 'hashed'),
  compare: jest.fn(async () => true),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'jwt-token'),
}));

describe('authService', () => {
  beforeEach(() => {
    mockPrisma.user.findUnique.mockReset();
    mockPrisma.user.create.mockReset();
    (bcrypt.hash as jest.Mock).mockClear();
    (bcrypt.compare as jest.Mock).mockClear();
    (jwt.sign as jest.Mock).mockClear();
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '7d';
  });

  it('signup creates user and returns token', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({
      id: 'u1',
      email: 'a@test.com',
      name: null,
      phone: null,
      languagePreference: 'he',
      createdAt: new Date(),
    });

    const { signup } = await import('../services/authService');
    const result = await signup({ email: 'a@test.com', password: 'Password1' });

    expect(result.token).toBe('jwt-token');
    expect(mockPrisma.user.create).toHaveBeenCalled();
  });

  it('login rejects invalid credentials when user not found', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const { login } = await import('../services/authService');
    await expect(login({ email: 'missing@test.com', password: 'Password1' })).rejects.toThrow(
      'Invalid email or password'
    );
  });
});


