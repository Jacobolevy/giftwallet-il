import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as establishmentService from '../services/establishmentService';
import { sendSuccess, sendError } from '../utils/response';

export const searchEstablishments = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { search } = req.query;

    const results = await establishmentService.searchEstablishmentsWithUserCards(
      req.userId!,
      search as string | undefined
    );

    sendSuccess(res, {
      establishments: results,
      total: results.length,
    });
  } catch (error: any) {
    sendError(res, 'INTERNAL_SERVER_ERROR', error.message, 500);
  }
};

export const getEstablishment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const establishment = await establishmentService.getEstablishmentById(
      req.params.id
    );

    if (!establishment) {
      sendError(res, 'NOT_FOUND', 'Establishment not found', 404);
      return;
    }

    sendSuccess(res, {
      id: establishment.id,
      name: establishment.name,
      name_he: establishment.nameHe,
      logo_url: establishment.logoUrl,
      issuers: establishment.issuers.map((ie) => ({
        id: ie.issuer.id,
        name: ie.issuer.name,
        name_he: ie.issuer.nameHe,
        brand_color: ie.issuer.brandColor,
        logo_url: ie.issuer.logoUrl,
      })),
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
      establishment: {
        id: result.establishment.id,
        name: result.establishment.name,
        name_he: result.establishment.nameHe,
        logo_url: result.establishment.logoUrl,
      },
      totalAmount: result.totalAmount,
      cards: result.cards.map((card) => ({
        id: card.id,
        label: card.label,
        label_he: card.labelHe,
        value_current: Number(card.valueCurrent),
        issuer: {
          id: card.issuer.id,
          name: card.issuer.name,
          name_he: card.issuer.nameHe,
          brand_color: card.issuer.brandColor,
          logo_url: card.issuer.logoUrl,
        },
      })),
    });
  } catch (error: any) {
    if (error.message === 'Establishment not found') {
      sendError(res, 'NOT_FOUND', error.message, 404);
    } else {
      sendError(res, 'INTERNAL_SERVER_ERROR', error.message, 500);
    }
  }
};
