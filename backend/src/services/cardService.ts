import { PrismaClient, CardStatus } from '@prisma/client';
import { encrypt, decrypt } from '../utils/encryption';

const prisma = new PrismaClient();

export interface CreateCardData {
  userId: string;
  issuerId: string;
  label: string;
  labelHe?: string;
  codeLast4: string;
  fullCode?: string;
  valueInitial: number;
  valueCurrent: number;
  notes?: string;
  photoUrl?: string;
}

export const createCard = async (data: CreateCardData) => {
  const {
    userId,
    issuerId,
    label,
    labelHe,
    codeLast4,
    fullCode,
    valueInitial,
    valueCurrent,
    notes,
    photoUrl,
  } = data;

  // Validate valueCurrent <= valueInitial
  if (valueCurrent > valueInitial) {
    throw new Error('Current value cannot exceed initial value');
  }

  // Encrypt full code if provided
  const encryptedCode = fullCode ? encrypt(fullCode.replace(/\s/g, '')) : null;

  // Create card
  const card = await prisma.card.create({
    data: {
      userId,
      issuerId,
      label,
      labelHe,
      codeLast4,
      fullCode: encryptedCode,
      valueInitial,
      valueCurrent,
      currency: 'ILS',
      status: CardStatus.active,
      notes,
      photoUrl,
    },
    include: {
      issuer: true,
    },
  });

  return card;
};

export const getCardsByUser = async (userId: string, filters?: { status?: CardStatus; issuerId?: string }) => {
  const where: any = { userId };

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.issuerId) {
    where.issuerId = filters.issuerId;
  }

  const cards = await prisma.card.findMany({
    where,
    include: {
      issuer: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return cards;
};

export const getCardById = async (cardId: string, userId: string) => {
  const card = await prisma.card.findFirst({
    where: {
      id: cardId,
      userId,
    },
    include: {
      issuer: true,
    },
  });

  if (!card) {
    throw new Error('Card not found');
  }

  return card;
};

export const markAsUsed = async (cardId: string, userId: string) => {
  const card = await prisma.card.findFirst({
    where: {
      id: cardId,
      userId,
    },
  });

  if (!card) {
    throw new Error('Card not found');
  }

  // Update card
  const updated = await prisma.card.update({
    where: { id: cardId },
    data: {
      valueCurrent: 0,
      status: CardStatus.used,
    },
    include: {
      issuer: true,
    },
  });

  return updated;
};

export const deleteCard = async (cardId: string, userId: string) => {
  const card = await prisma.card.findFirst({
    where: {
      id: cardId,
      userId,
    },
  });

  if (!card) {
    throw new Error('Card not found');
  }

  await prisma.card.delete({
    where: { id: cardId },
  });

  return { success: true };
};

export const getCardFullCode = async (cardId: string, userId: string) => {
  const card = await prisma.card.findFirst({
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
