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

export const getCardsByUser = async (userId: string) => {
  return prisma.userCard.findMany({
    where: { userId },
    include: {
      cardProduct: { include: { issuer: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
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
