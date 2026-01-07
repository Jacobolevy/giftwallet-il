import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as establishmentService from '../services/establishmentService';
import { sendSuccess, sendError } from '../utils/response';

export const searchEstablishments = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { q } = req.query;

    const results = await establishmentService.searchStoresWithUserBalance(
      req.userId!,
      q as string | undefined
    );

    sendSuccess(res, {
      stores: results,
      total: results.length,
    });
  } catch (error: any) {
    sendError(res, 'INTERNAL_SERVER_ERROR', error.message, 500);
  }
};

export const getMyCardsForEstablishment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const result = await establishmentService.getUserCardsForEstablishment(
      req.userId!,
      req.params.id
    );

    sendSuccess(res, {
      store: {
        id: result.store.id,
        name: result.store.name,
        category: result.store.category,
        website_url: result.store.websiteUrl,
      },
      totalAmount: result.totalAmount,
      cards: result.cards.map((card) => ({
        id: card.id,
        nickname: card.nickname,
        balance: Number(card.balance),
        cardProduct: {
          id: card.cardProduct.id,
          name: card.cardProduct.name,
          issuer: {
            id: card.cardProduct.issuer.id,
            name: card.cardProduct.issuer.name,
            logoUrl: card.cardProduct.issuer.logoUrl,
          },
        },
      })),
    });
  } catch (error: any) {
    if (error.message === 'Store not found') {
      sendError(res, 'NOT_FOUND', error.message, 404);
    } else {
      sendError(res, 'INTERNAL_SERVER_ERROR', error.message, 500);
    }
  }
};
