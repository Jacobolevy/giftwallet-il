import { PrismaClient, UserCardStatus } from '@prisma/client';
import { encrypt, decrypt } from '../utils/encryption';

const prisma = new PrismaClient();

export interface CreateCardData {
  userId: string;
  cardProductId: string;
  nickname?: string;
  balance?: number;
  expiresAt?: Date;
  codeLast4: string;
  fullCode?: string;
}

export const createCard = async (data: CreateCardData) => {
  const {
    userId,
    cardProductId,
    nickname,
    balance,
    expiresAt,
    codeLast4,
    fullCode,
  } = data;

  const product = await prisma.cardProduct.findUnique({
    where: { id: cardProductId },
    select: { id: true },
  });
  if (!product) {
    throw new Error('CardProduct not found');
  }

  // Encrypt full code if provided
  const encryptedCode = fullCode ? encrypt(fullCode.replace(/\s/g, '')) : null;

  // Create card
  const card = await prisma.userCard.create({
    data: {
      userId,
      cardProductId,
      nickname,
      balance: balance ?? 0,
      expiresAt,
      codeLast4,
      fullCode: encryptedCode,
      status: UserCardStatus.active,
    },
    include: {
      cardProduct: {
        include: { issuer: true },
      },
    },
  });

  return card;
};

export interface GetCardsOptions {
  issuerId?: string;
  storeId?: string;
  category?: string;
  minBalance?: number;
  maxBalance?: number;
  status?: string;
  isExpired?: boolean;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  skip?: number;
  take?: number;
}

export const getCardsByUser = async (userId: string, options: GetCardsOptions = {}) => {
  const {
    issuerId,
    storeId,
    category,
    minBalance,
    maxBalance,
    status,
    isExpired,
    search,
    sortBy = 'createdAt',
    order = 'desc',
    skip = 0,
    take = 50
  } = options;

  const andConditions: any[] = [{ userId }];

  // Search: matches nickname or cardProduct name
  if (search) {
    andConditions.push({
      OR: [
        { nickname: { contains: search, mode: 'insensitive' } },
        { cardProduct: { name: { contains: search, mode: 'insensitive' } } },
      ],
    });
  }

  // Filter by Issuer
  if (issuerId) {
    andConditions.push({
      cardProduct: {
        issuerId,
      },
    });
  }

  // Filter by Store Category
  if (category) {
    andConditions.push({
      cardProduct: {
        stores: {
          some: {
            store: {
              category: {
                contains: category,
                mode: 'insensitive',
              },
            },
          },
        },
      },
    });
  }

  // Filter by Store ID
  if (storeId) {
    andConditions.push({
      cardProduct: {
        stores: {
          some: {
            storeId: storeId,
          },
        },
      },
    });
  }

  // Filter by Status
  if (status) {
    // Validate status if necessary or let Prisma throw if invalid enum?
    // Better to pass it through, controller handles validation or we handle it here.
    // Assuming status is valid UserCardStatus string.
    andConditions.push({ status: status as UserCardStatus });
  }

  // Filter by Balance Range
  if (minBalance !== undefined || maxBalance !== undefined) {
    const balanceCondition: any = {};
    if (minBalance !== undefined) balanceCondition.gte = minBalance;
    if (maxBalance !== undefined) balanceCondition.lte = maxBalance;
    andConditions.push({ balance: balanceCondition });
  }

  // Filter by Expiration
  if (isExpired !== undefined) {
    const now = new Date();
    if (isExpired) {
      andConditions.push({ expiresAt: { lt: now } });
    } else {
      andConditions.push({
        OR: [
          { expiresAt: { gte: now } },
          { expiresAt: null },
        ],
      });
    }
  }

  const finalWhere = { AND: andConditions };

  // Determine Sorting
  let orderBy: any = {};
  switch (sortBy) {
    case 'expirationDate':
    case 'expiresAt':
      orderBy = { expiresAt: order };
      break;
    case 'balance':
      orderBy = { balance: order };
      break;
    case 'createdAt':
    default:
      orderBy = { createdAt: order };
      break;
  }

  const [cards, total] = await Promise.all([
    prisma.userCard.findMany({
      where: finalWhere,
      include: {
        cardProduct: {
          include: {
            issuer: true,
            // Including stores might be heavy if there are many, but requested "relaciones necesarias"
            // Usually issuer and cardProduct are enough for list.
            // stores is available via another endpoint or if explicitly requested?
            // Prompt says: "include (include) las relaciones necesarias en la respuesta (Issuer, CardProduct)"
            // It doesn't explicitly say "Store", but "CardProduct -> Issuer" is there.
            // I'll stick to what was there: cardProduct with issuer.
          } 
        },
      },
      orderBy,
      skip,
      take,
    }),
    prisma.userCard.count({ where: finalWhere }),
  ]);

  return { cards, total, skip, take };
};

export const getCardById = async (cardId: string, userId: string) => {
  const card = await prisma.userCard.findFirst({
    where: {
      id: cardId,
      userId,
    },
    include: {
      cardProduct: { include: { issuer: true } },
    },
  });

  if (!card) {
    throw new Error('Card not found');
  }

  return card;
};

export const markAsUsed = async (cardId: string, userId: string) => {
  const card = await prisma.userCard.findFirst({
    where: {
      id: cardId,
      userId,
    },
  });

  if (!card) {
    throw new Error('Card not found');
  }

  const updated = await prisma.userCard.update({
    where: { id: cardId },
    data: {
      balance: 0,
      status: UserCardStatus.used,
    },
    include: {
      cardProduct: { include: { issuer: true } },
    },
  });

  return updated;
};

export const deleteCard = async (cardId: string, userId: string) => {
  const card = await prisma.userCard.findFirst({
    where: {
      id: cardId,
      userId,
    },
  });

  if (!card) {
    throw new Error('Card not found');
  }

  await prisma.userCard.delete({
    where: { id: cardId },
  });

  return { success: true };
};

export const getCardFullCode = async (cardId: string, userId: string) => {
  const card = await prisma.userCard.findFirst({
    where: {
      id: cardId,
      userId,
    },
    select: {
      fullCode: true,
    },
  });

  if (!card || !card.fullCode) {
    throw new Error('Card code not available');
  }

  return decrypt(card.fullCode);
};
