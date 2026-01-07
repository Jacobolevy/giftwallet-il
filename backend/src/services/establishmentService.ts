import { PrismaClient, CardStatus } from '@prisma/client';

const prisma = new PrismaClient();

export const searchEstablishments = async (query: string) => {
  return prisma.establishment.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { nameHe: { contains: query, mode: 'insensitive' } },
      ],
    },
    include: {
      issuers: {
        include: {
          issuer: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });
};

export const getEstablishmentById = async (id: string) => {
  return prisma.establishment.findUnique({
    where: { id },
    include: {
      issuers: {
        include: {
          issuer: true,
        },
      },
    },
  });
};

export const getUserCardsForEstablishment = async (
  userId: string,
  establishmentId: string
) => {
  // Get all issuer IDs that are accepted at this establishment
  const establishment = await prisma.establishment.findUnique({
    where: { id: establishmentId },
    include: {
      issuers: {
        select: { issuerId: true },
      },
    },
  });

  if (!establishment) {
    throw new Error('Establishment not found');
  }

  const issuerIds = establishment.issuers.map((ie) => ie.issuerId);

  // Get user's active cards from these issuers
  const cards = await prisma.card.findMany({
    where: {
      userId,
      issuerId: { in: issuerIds },
      status: CardStatus.active,
    },
    include: {
      issuer: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate total available balance
  const totalAmount = cards.reduce(
    (sum, card) => sum + Number(card.valueCurrent),
    0
  );

  return {
    establishment,
    cards,
    totalAmount,
  };
};

// Search establishments and return with user's card totals
export const searchEstablishmentsWithUserCards = async (
  userId: string,
  query?: string
) => {
  if (!query || query.length < 2) return [];

  const establishments = await searchEstablishments(query);

  const results = await Promise.all(
    establishments.map(async (establishment) => {
      const issuerIds = establishment.issuers.map((ie) => ie.issuerId);

      const cards = await prisma.card.findMany({
        where: {
          userId,
          issuerId: { in: issuerIds },
          status: CardStatus.active,
        },
        include: { issuer: true },
        orderBy: { createdAt: 'desc' },
      });

      const totalAmount = cards.reduce(
        (sum, card) => sum + Number(card.valueCurrent),
        0
      );

      return {
        id: establishment.id,
        name: establishment.name,
        nameHe: establishment.nameHe,
        logoUrl: establishment.logoUrl,
        totalAmount,
        cards: cards.map((card) => ({
          id: card.id,
          label: card.label,
          labelHe: card.labelHe,
          valueCurrent: Number(card.valueCurrent),
          issuer: {
            id: card.issuer.id,
            name: card.issuer.name,
            nameHe: card.issuer.nameHe,
            brandColor: card.issuer.brandColor,
            logoUrl: card.issuer.logoUrl,
          },
        })),
      };
    })
  );

  return results.sort((a, b) => b.totalAmount - a.totalAmount || a.name.localeCompare(b.name));
};

export const getEstablishmentsForCard = async (userId: string, cardId: string) => {
  const card = await prisma.card.findFirst({
    where: { id: cardId, userId },
    select: { issuerId: true },
  });

  if (!card) throw new Error('Card not found');

  const links = await prisma.issuerEstablishment.findMany({
    where: { issuerId: card.issuerId },
    include: { establishment: true },
    orderBy: { establishment: { name: 'asc' } },
  });

  return links.map((link) => ({
    id: link.establishment.id,
    name: link.establishment.name,
    nameHe: link.establishment.nameHe,
    logoUrl: link.establishment.logoUrl,
    type: link.type,
    notes: link.notes,
  }));
};

