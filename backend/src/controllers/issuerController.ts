import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const getAllIssuers = async (req: Request | AuthRequest, res: Response): Promise<void> => {
  try {
    const language = (req as any).query?.language || 
                    ((req as AuthRequest).user?.languagePreference || 'he');

    const issuers = await prisma.issuer.findMany({
      orderBy: { name: 'asc' },
    });

    // If user is authenticated, add card count and total value
    if ((req as AuthRequest).userId) {
      const userId = (req as AuthRequest).userId!;
      const cards = await prisma.giftCard.findMany({
        where: { userId },
        include: { issuer: true },
      });

      const issuersWithStats = issuers.map(issuer => {
        const issuerCards = cards.filter(c => c.issuerId === issuer.id);
        const activeCards = issuerCards.filter(c => c.status === 'active');
        const totalValue = activeCards.reduce(
          (sum, card) => sum + Number(card.valueCurrent),
          0
        );

        return {
          id: issuer.id,
          name: issuer.name,
          name_he: issuer.nameHe,
          website_url: issuer.websiteUrl,
          logo_url: issuer.logoUrl,
          brand_color: issuer.brandColor,
          support_phone: issuer.supportPhone,
          support_email: issuer.supportEmail,
          balance_check_url: issuer.balanceCheckUrl,
          ...(userId && {
            card_count: issuerCards.length,
            total_value: totalValue,
          }),
        };
      });

      sendSuccess(res, issuersWithStats);
    } else {
      const formattedIssuers = issuers.map(issuer => ({
        id: issuer.id,
        name: issuer.name,
        name_he: issuer.nameHe,
        website_url: issuer.websiteUrl,
        logo_url: issuer.logoUrl,
        brand_color: issuer.brandColor,
        support_phone: issuer.supportPhone,
        support_email: issuer.supportEmail,
        balance_check_url: issuer.balanceCheckUrl,
      }));

      sendSuccess(res, formattedIssuers);
    }
  } catch (error: any) {
    sendError(res, 'INTERNAL_SERVER_ERROR', error.message, 500);
  }
};

export const getIssuer = async (req: Request | AuthRequest, res: Response): Promise<void> => {
  try {
    const issuer = await prisma.issuer.findUnique({
      where: { id: req.params.id },
    });

    if (!issuer) {
      sendError(res, 'NOT_FOUND', 'Issuer not found', 404);
      return;
    }

    let cardCount = 0;
    let totalValue = 0;

    // If user is authenticated, add stats
    if ((req as AuthRequest).userId) {
      const userId = (req as AuthRequest).userId!;
      const cards = await prisma.giftCard.findMany({
        where: {
          userId,
          issuerId: issuer.id,
        },
      });

      cardCount = cards.length;
      const activeCards = cards.filter(c => c.status === 'active');
      totalValue = activeCards.reduce(
        (sum, card) => sum + Number(card.valueCurrent),
        0
      );
    }

    sendSuccess(res, {
      id: issuer.id,
      name: issuer.name,
      name_he: issuer.nameHe,
      website_url: issuer.websiteUrl,
      logo_url: issuer.logoUrl,
      brand_color: issuer.brandColor,
      support_phone: issuer.supportPhone,
      support_email: issuer.supportEmail,
      notes: issuer.notes,
      balance_check_url: issuer.balanceCheckUrl,
      ...(cardCount > 0 && {
        card_count: cardCount,
        total_value: totalValue,
      }),
    });
  } catch (error: any) {
    sendError(res, 'INTERNAL_SERVER_ERROR', error.message, 500);
  }
};
