import { PrismaClient, UserCardStatus } from '@prisma/client';

const prisma = new PrismaClient();

export const getUserCardsForEstablishment = async (
  userId: string,
  storeId: string
) => {
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) throw new Error('Store not found');

  // Fetch the user's active cards whose CardProduct is usable at this store
  const userCards = await prisma.userCard.findMany({
    where: {
      userId,
      status: UserCardStatus.active,
      balance: { gt: 0 },
      cardProduct: {
        stores: {
          some: { storeId },
        },
      },
    },
    include: {
      cardProduct: { include: { issuer: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalAmount = userCards.reduce((sum, c) => sum + Number(c.balance || 0), 0);

  return { store, cards: userCards, totalAmount };
};

/**
 * Search stores by name, but return ONLY stores where the user has spendable balance > 0
 * via their active UserCards and the CardProductStore mapping.
 */
export const searchStoresWithUserBalance = async (userId: string, q?: string) => {
  if (!q || q.trim().length < 2) return [];
  const query = q.trim();

  // Load user's active cards with balance > 0 and their product-store relationships
  const userCards = await prisma.userCard.findMany({
    where: {
      userId,
      status: UserCardStatus.active,
      balance: { gt: 0 },
    },
    include: {
      cardProduct: {
        include: {
          issuer: true,
          stores: { include: { store: true } },
        },
      },
    },
  });

  // Build store totals and breakdown, then filter by store name match
  const storeMap = new Map<
    string,
    {
      id: string;
      name: string;
      category?: string | null;
      websiteUrl?: string | null;
      totalAmount: number;
      cards: Array<{
        id: string;
        nickname?: string | null;
        balance: number;
        cardProduct: { id: string; name: string; issuer: { id: string; name: string; logoUrl?: string | null } };
      }>;
    }
  >();

  for (const card of userCards) {
    const usableStores = card.cardProduct.stores.map((s) => s.store);
    for (const store of usableStores) {
      const match =
        store.name.toLowerCase().includes(query.toLowerCase()) ||
        (store.category || '').toLowerCase().includes(query.toLowerCase());
      if (!match) continue;

      const existing =
        storeMap.get(store.id) ||
        {
          id: store.id,
          name: store.name,
          category: store.category,
          websiteUrl: store.websiteUrl,
          totalAmount: 0,
          cards: [],
        };

      existing.totalAmount += Number(card.balance || 0);
      existing.cards.push({
        id: card.id,
        nickname: card.nickname,
        balance: Number(card.balance || 0),
        cardProduct: {
          id: card.cardProduct.id,
          name: card.cardProduct.name,
          issuer: {
            id: card.cardProduct.issuer.id,
            name: card.cardProduct.issuer.name,
            logoUrl: card.cardProduct.issuer.logoUrl,
          },
        },
      });

      storeMap.set(store.id, existing);
    }
  }

  return Array.from(storeMap.values()).sort((a, b) => b.totalAmount - a.totalAmount || a.name.localeCompare(b.name));
};

export const getStoresForUserCard = async (userId: string, userCardId: string) => {
  const card = await prisma.userCard.findFirst({
    where: { id: userCardId, userId },
    include: {
      cardProduct: {
        include: {
          stores: { include: { store: true } },
        },
      },
    },
  });
  if (!card) throw new Error('Card not found');

  return card.cardProduct.stores
    .map((s) => ({
      id: s.store.id,
      name: s.store.name,
      category: s.store.category,
      websiteUrl: s.store.websiteUrl,
      type: s.type,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

