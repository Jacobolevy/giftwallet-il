import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as cardService from '../services/cardService';
import * as establishmentService from '../services/establishmentService';
import { sendSuccess, sendError } from '../utils/response';

export const createCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const card = await cardService.createCard({
      ...req.body,
      userId: req.userId!,
    });

    sendSuccess(res, {
      id: card.id,
      cardProduct: {
        id: card.cardProduct.id,
        name: card.cardProduct.name,
        description: card.cardProduct.description,
        issuer: {
          id: card.cardProduct.issuer.id,
          name: card.cardProduct.issuer.name,
          logoUrl: card.cardProduct.issuer.logoUrl,
        },
      },
      nickname: card.nickname,
      codeLast4: card.codeLast4,
      balance: Number(card.balance),
      expiresAt: card.expiresAt,
      status: card.status,
      createdAt: card.createdAt,
    }, 201);
  } catch (error: any) {
    sendError(res, 'VALIDATION_ERROR', error.message, 400);
  }
};

export const getCards = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { 
      issuerId, 
      storeId,
      category, 
      status,
      minBalance, 
      maxBalance, 
      isExpired, 
      search, 
      sortBy,
      order,
      page, 
      limit 
    } = req.query;

    const pageNum = page ? parseInt(page as string) : 1;
    const limitNum = limit ? parseInt(limit as string) : 50;
    const skip = (pageNum - 1) * limitNum;

    // Validate Sort Order
    const sortOrder = order === 'asc' ? 'asc' : 'desc';

    const { cards, total } = await cardService.getCardsByUser(req.userId!, {
      issuerId: issuerId as string,
      storeId: storeId as string,
      category: category as string,
      status: status as string,
      minBalance: minBalance ? parseFloat(minBalance as string) : undefined,
      maxBalance: maxBalance ? parseFloat(maxBalance as string) : undefined,
      isExpired: isExpired === 'true' ? true : isExpired === 'false' ? false : undefined,
      search: search as string,
      sortBy: sortBy as string,
      order: sortOrder,
      skip,
      take: limitNum,
    });

    sendSuccess(
      res,
      {
        data: cards.map((card) => ({
          id: card.id,
          cardProduct: {
            id: card.cardProduct.id,
            name: card.cardProduct.name,
            issuer: {
              id: card.cardProduct.issuer.id,
              name: card.cardProduct.issuer.name,
              logoUrl: card.cardProduct.issuer.logoUrl,
            },
          },
          nickname: card.nickname,
          codeLast4: card.codeLast4,
          balance: Number(card.balance),
          expiresAt: card.expiresAt,
          status: card.status,
          createdAt: card.createdAt,
          updatedAt: card.updatedAt,
        })),
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      }
    );
  } catch (error: any) {
    // Basic error handling for invalid params if service throws
    if (error.message.includes('Invalid')) {
       sendError(res, 'VALIDATION_ERROR', error.message, 400);
       return;
    }
    sendError(res, 'INTERNAL_SERVER_ERROR', error.message, 500);
  }
};

export const getCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const card = await cardService.getCardById(req.params.id, req.userId!);
    sendSuccess(res, {
      id: card.id,
      cardProduct: {
        id: card.cardProduct.id,
        name: card.cardProduct.name,
        description: card.cardProduct.description,
        issuer: {
          id: card.cardProduct.issuer.id,
          name: card.cardProduct.issuer.name,
          websiteUrl: card.cardProduct.issuer.websiteUrl,
          logoUrl: card.cardProduct.issuer.logoUrl,
        },
      },
      nickname: card.nickname,
      codeLast4: card.codeLast4,
      balance: Number(card.balance),
      expiresAt: card.expiresAt,
      status: card.status,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
    });
  } catch (error: any) {
    if (error.message === 'Card not found') {
      sendError(res, 'NOT_FOUND', 'Card not found', 404, {
        resource: 'Card',
        id: req.params.id,
      });
    } else {
      sendError(res, 'INTERNAL_SERVER_ERROR', error.message, 500);
    }
  }
};

export const markAsUsed = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const card = await cardService.markAsUsed(req.params.id, req.userId!);
    
    sendSuccess(res, {
      id: card.id,
      balance: 0,
      status: card.status,
      updatedAt: card.updatedAt,
    }, 200);
  } catch (error: any) {
    sendError(res, 'VALIDATION_ERROR', error.message, 400);
  }
};

export const deleteCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await cardService.deleteCard(req.params.id, req.userId!);
    sendSuccess(res, null, 200);
  } catch (error: any) {
    sendError(res, 'NOT_FOUND', error.message, 404);
  }
};

export const getCardFullCode = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const fullCode = await cardService.getCardFullCode(req.params.id, req.userId!);
    sendSuccess(res, {
      full_code: fullCode,
    });
  } catch (error: any) {
    sendError(res, 'NOT_FOUND', error.message, 404);
  }
};

export const getCardEstablishments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stores = await establishmentService.getStoresForUserCard(req.userId!, req.params.id);
    sendSuccess(res, { stores });
  } catch (error: any) {
    if (error.message === 'Card not found') {
      sendError(res, 'NOT_FOUND', 'Card not found', 404);
      return;
    }
    sendError(res, 'INTERNAL_SERVER_ERROR', error.message, 500);
  }
};
