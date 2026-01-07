const mockPrisma = {
  cardProduct: {
    findUnique: jest.fn(),
  },
  userCard: {
    create: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
  UserCardStatus: { active: 'active', used: 'used' },
}));

jest.mock('../utils/encryption', () => ({
  encrypt: (t: string) => `enc(${t})`,
  decrypt: (t: string) => t,
}));

describe('cardService', () => {
  beforeEach(() => {
    mockPrisma.cardProduct.findUnique.mockReset();
    mockPrisma.userCard.create.mockReset();
  });

  it('createCard validates product and creates UserCard', async () => {
    mockPrisma.cardProduct.findUnique.mockResolvedValue({ id: 'p1' });
    mockPrisma.userCard.create.mockResolvedValue({
      id: 'c1',
      codeLast4: '1234',
      fullCode: 'enc(9999)',
      balance: 50,
      status: 'active',
      cardProduct: { id: 'p1', name: 'Prod', issuer: { id: 'i1', name: 'Issuer' } },
    });

    const { createCard } = await import('../services/cardService');
    const result = await createCard({
      userId: 'u1',
      cardProductId: 'p1',
      codeLast4: '1234',
      fullCode: '9999',
      balance: 50,
    });

    expect(mockPrisma.cardProduct.findUnique).toHaveBeenCalledWith({
      where: { id: 'p1' },
      select: { id: true },
    });
    expect(mockPrisma.userCard.create).toHaveBeenCalled();
    expect(result.id).toBe('c1');
  });
});


