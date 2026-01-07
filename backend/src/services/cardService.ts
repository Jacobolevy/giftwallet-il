import { PrismaClient, CardStatus } from '@prisma/client';
import { encrypt, decrypt } from '../utils/encryption';
import { addDays, differenceInDays, isPast, isToday } from 'date-fns';

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
  expiryDate: Date;
  notes?: string;
  photoUrl?: string;
}

export interface UpdateCardData {
  label?: string;
  labelHe?: string;
  valueCurrent?: number;
  expiryDate?: Date;
  notes?: string;
  photoUrl?: string;
  fullCode?: string;
  codeLast4?: string;
}

export interface BalanceUpdateData {
  newBalance: number;
  changeType?: 'manual_update' | 'purchase' | 'refund' | 'correction';
  notes?: string;
  store?: string;
  transactionDate?: Date;
}

const determineStatus = (expiryDate: Date): CardStatus => {
  if (isPast(expiryDate) && !isToday(expiryDate)) {
    return CardStatus.expired;
  }
  return CardStatus.active;
};

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
    expiryDate,
    notes,
    photoUrl,
  } = data;

  // Validate valueCurrent <= valueInitial
  if (valueCurrent > valueInitial) {
    throw new Error('Current value cannot exceed initial value');
  }

  // Determine status
  const status = determineStatus(expiryDate);

  // Encrypt full code if provided
  const encryptedCode = fullCode ? encrypt(fullCode.replace(/\s/g, '')) : null;

  // Create card
  const card = await prisma.giftCard.create({
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
      expiryDate,
      status,
      notes,
      photoUrl,
      lastBalanceUpdate: new Date(),
    },
    include: {
      issuer: true,
    },
  });

  // Create initial balance history
  await prisma.balanceHistory.create({
    data: {
      giftcardId: card.id,
      previousBalance: 0,
      newBalance: valueCurrent,
      changeAmount: valueCurrent,
      changeType: 'manual_update',
      notes: 'Initial balance',
    },
  });

  // Create reminders if card is active and expiry is in future
  let remindersCreated = 0;
  if (status === CardStatus.active && !isPast(expiryDate)) {
    const reminderDates = [
      addDays(expiryDate, -30),
      addDays(expiryDate, -7),
    ].filter(date => !isPast(date) || isToday(date));

    for (const reminderDate of reminderDates) {
      await prisma.reminder.create({
        data: {
          userId,
          giftcardId: card.id,
          reminderDate,
          type: differenceInDays(expiryDate, reminderDate) === 30
            ? 'thirty_days_before'
            : 'seven_days_before',
        },
      });
      remindersCreated++;
    }
  }

  return { ...card, remindersCreated };
};

export const getCardsByUser = async (userId: string, filters?: {
  status?: CardStatus;
  issuerId?: string;
  expiringSoon?: boolean;
}) => {
  const where: any = { userId };

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.issuerId) {
    where.issuerId = filters.issuerId;
  }

  if (filters?.expiringSoon) {
    const thirtyDaysFromNow = addDays(new Date(), 30);
    where.expiryDate = {
      lte: thirtyDaysFromNow,
      gte: new Date(),
    };
  }

  const cards = await prisma.giftCard.findMany({
    where,
    include: {
      issuer: true,
    },
    orderBy: {
      expiryDate: 'asc',
    },
  });

  return cards;
};

export const getCardById = async (cardId: string, userId: string) => {
  const card = await prisma.giftCard.findFirst({
    where: {
      id: cardId,
      userId,
    },
    include: {
      issuer: true,
      balanceHistory: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      reminders: {
        orderBy: {
          reminderDate: 'asc',
        },
      },
    },
  });

  if (!card) {
    throw new Error('Card not found');
  }

  return card;
};

export const updateCard = async (cardId: string, userId: string, data: UpdateCardData) => {
  const card = await prisma.giftCard.findFirst({
    where: {
      id: cardId,
      userId,
    },
  });

  if (!card) {
    throw new Error('Card not found');
  }

  const updateData: any = { ...data };

  // Handle full code update
  if (data.fullCode) {
    updateData.fullCode = encrypt(data.fullCode.replace(/\s/g, ''));
    if (data.codeLast4) {
      updateData.codeLast4 = data.codeLast4;
    } else {
      updateData.codeLast4 = data.fullCode.slice(-4);
    }
  }

  // If expiry date changed, update status and reminders
  if (data.expiryDate) {
    updateData.status = determineStatus(data.expiryDate);
    
    // Update or create reminders
    await prisma.reminder.deleteMany({
      where: { giftcardId: cardId },
    });

    if (updateData.status === CardStatus.active && !isPast(data.expiryDate)) {
      const reminderDates = [
        addDays(data.expiryDate, -30),
        addDays(data.expiryDate, -7),
      ].filter(date => !isPast(date) || isToday(date));

      for (const reminderDate of reminderDates) {
        await prisma.reminder.create({
          data: {
            userId,
            giftcardId: cardId,
            reminderDate,
            type: differenceInDays(data.expiryDate, reminderDate) === 30
              ? 'thirty_days_before'
              : 'seven_days_before',
          },
        });
      }
    }
  }

  const updated = await prisma.giftCard.update({
    where: { id: cardId },
    data: updateData,
    include: {
      issuer: true,
    },
  });

  return updated;
};

export const updateBalance = async (
  cardId: string,
  userId: string,
  data: BalanceUpdateData
) => {
  const card = await prisma.giftCard.findFirst({
    where: {
      id: cardId,
      userId,
    },
  });

  if (!card) {
    throw new Error('Card not found');
  }

  const previousBalance = Number(card.valueCurrent);
  const newBalance = data.newBalance;
  const changeAmount = newBalance - previousBalance;

  // Update card
  const updated = await prisma.giftCard.update({
    where: { id: cardId },
    data: {
      valueCurrent: newBalance,
      lastBalanceUpdate: new Date(),
      status: newBalance === 0 ? CardStatus.used : card.status,
    },
    include: {
      issuer: true,
    },
  });

  // Create balance history
  await prisma.balanceHistory.create({
    data: {
      giftcardId: cardId,
      previousBalance,
      newBalance,
      changeAmount,
      changeType: data.changeType || 'manual_update',
      notes: data.notes || data.store
        ? `${data.store ? `Store: ${data.store}. ` : ''}${data.notes || ''}`
        : undefined,
    },
  });

  // If balance is 0, mark as used and cancel future reminders
  if (newBalance === 0) {
    await prisma.reminder.deleteMany({
      where: {
        giftcardId: cardId,
        sentFlag: false,
      },
    });
  }

  return updated;
};

export const markAsUsed = async (cardId: string, userId: string) => {
  const card = await prisma.giftCard.findFirst({
    where: {
      id: cardId,
      userId,
    },
  });

  if (!card) {
    throw new Error('Card not found');
  }

  // Update card
  const updated = await prisma.giftCard.update({
    where: { id: cardId },
    data: {
      valueCurrent: 0,
      status: CardStatus.used,
      lastBalanceUpdate: new Date(),
    },
    include: {
      issuer: true,
    },
  });

  // Create balance history
  await prisma.balanceHistory.create({
    data: {
      giftcardId: cardId,
      previousBalance: card.valueCurrent,
      newBalance: 0,
      changeAmount: -Number(card.valueCurrent),
      changeType: 'purchase',
      notes: 'Marked as used',
    },
  });

  // Cancel future reminders
  await prisma.reminder.deleteMany({
    where: {
      giftcardId: cardId,
      sentFlag: false,
    },
  });

  return updated;
};

export const deleteCard = async (cardId: string, userId: string) => {
  const card = await prisma.giftCard.findFirst({
    where: {
      id: cardId,
      userId,
    },
  });

  if (!card) {
    throw new Error('Card not found');
  }

  await prisma.giftCard.delete({
    where: { id: cardId },
  });

  return { success: true };
};

export const getCardFullCode = async (cardId: string, userId: string) => {
  const card = await prisma.giftCard.findFirst({
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

export const getWalletStats = async (userId: string) => {
  const cards = await prisma.giftCard.findMany({
    where: { userId },
    include: {
      issuer: true,
    },
  });

  const activeCards = cards.filter(c => c.status === CardStatus.active);
  const expiringSoon = activeCards.filter(c => {
    const daysLeft = differenceInDays(c.expiryDate, new Date());
    return daysLeft <= 30 && daysLeft >= 0;
  });

  const totalActiveValue = activeCards.reduce(
    (sum, card) => sum + Number(card.valueCurrent),
    0
  );

  return {
    totalCards: cards.length,
    activeCards: activeCards.length,
    expiringSoon: expiringSoon.length,
    totalActiveValue,
    expiredCards: cards.filter(c => c.status === CardStatus.expired).length,
    usedCards: cards.filter(c => c.status === CardStatus.used).length,
  };
};
