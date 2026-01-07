const mockPrisma = {
  store: {
    findUnique: jest.fn(),
  },
  userCard: {
    findMany: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
  UserCardStatus: { active: 'active', used: 'used' },
}));

describe('establishmentService (stores)', () => {
  beforeEach(() => {
    mockPrisma.store.findUnique.mockReset();
    mockPrisma.userCard.findMany.mockReset();
  });

  it('searchStoresWithUserBalance returns ONLY stores that match q and where user has balance > 0', async () => {
    mockPrisma.userCard.findMany.mockResolvedValue([
      {
        id: 'uc1',
        nickname: 'Work',
        balance: 100,
        cardProduct: {
          id: 'p1',
          name: 'BuyMe Fashion',
          issuer: { id: 'i1', name: 'BuyMe', logoUrl: null },
          stores: [
            { store: { id: 's1', name: 'Castro', category: 'fashion', websiteUrl: null } },
            { store: { id: 's2', name: 'Bug', category: 'electronics', websiteUrl: null } },
          ],
        },
      },
    ]);

    const { searchStoresWithUserBalance } = await import('../services/establishmentService');
    const results = await searchStoresWithUserBalance('u1', 'cas');

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Castro');
    expect(results[0].totalAmount).toBe(100);
  });

  it('getUserCardsForEstablishment returns totalAmount and cards list', async () => {
    mockPrisma.store.findUnique.mockResolvedValue({
      id: 's1',
      name: 'Castro',
      category: 'fashion',
      websiteUrl: null,
    });
    mockPrisma.userCard.findMany.mockResolvedValue([
      {
        id: 'uc1',
        nickname: null,
        balance: 40,
        cardProduct: { id: 'p1', name: 'Prod', issuer: { id: 'i1', name: 'Issuer' } },
      },
      {
        id: 'uc2',
        nickname: null,
        balance: 60,
        cardProduct: { id: 'p2', name: 'Prod2', issuer: { id: 'i1', name: 'Issuer' } },
      },
    ]);

    const { getUserCardsForEstablishment } = await import('../services/establishmentService');
    const result = await getUserCardsForEstablishment('u1', 's1');

    expect(result.totalAmount).toBe(100);
    expect(result.cards).toHaveLength(2);
    expect(result.store.name).toBe('Castro');
  });
});


