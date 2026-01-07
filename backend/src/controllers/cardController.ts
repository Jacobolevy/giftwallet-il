import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as cardService from '../services/cardService';
import { sendSuccess, sendError } from '../utils/response';
import { differenceInDays, format } from 'date-fns';
import { ApiError } from '../middleware/errorHandler';

const getStatusColor = (daysLeft: number, status: string): string => {
  if (status === 'expired' || status === 'used') return 'gray';
  if (daysLeft <= 7) return 'red';
  if (daysLeft <= 30) return 'yellow';
  return 'green';
};

export const createCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const card = await cardService.createCard({
      ...req.body,
      userId: req.userId!,
    });

    sendSuccess(
      res,
      {
        id: card.id,
        issuer: card.issuer,
        label: card.label,
        codeLast4: card.codeLast4,
        valueInitial: card.valueInitial,
        valueCurrent: card.valueCurrent,
        currency: card.currency,
        expiryDate: card.expiryDate,
        status: card.status,
        createdAt: card.createdAt,
        reminders_created: (card as any).remindersCreated || 0,
      },
      201,
      `Gift card added successfully. ${(card as any).remindersCreated || 0} reminders scheduled.`
    );
  } catch (error: any) {
    sendError(res, 'VALIDATION_ERROR', error.message, 400);
  }
};

export const getCards = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      status,
      issuer_id,
      sort = 'expiry_date',
      order = 'asc',
      expiring_soon,
      page = '1',
      limit = '50',
    } = req.query;

    const filters: any = {};
    if (status && status !== 'all') filters.status = status;
    if (issuer_id) filters.issuerId = issuer_id as string;
    if (expiring_soon === 'true') filters.expiringSoon = true;

    const cards = await cardService.getCardsByUser(req.userId!, filters);
    const stats = await cardService.getWalletStats(req.userId!);

    // Apply sorting
    const sortedCards = [...cards].sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (sort) {
        case 'expiry_date':
          aVal = new Date(a.expiryDate).getTime();
          bVal = new Date(b.expiryDate).getTime();
          break;
        case 'value_current':
          aVal = Number(a.valueCurrent);
          bVal = Number(b.valueCurrent);
          break;
        case 'issuer_name':
          aVal = a.issuer.name;
          bVal = b.issuer.name;
          break;
        case 'created_at':
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        default:
          aVal = new Date(a.expiryDate).getTime();
          bVal = new Date(b.expiryDate).getTime();
      }

      if (order === 'desc') {
        return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
      }
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    });

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 100);
    const start = (pageNum - 1) * limitNum;
    const end = start + limitNum;
    const paginatedCards = sortedCards.slice(start, end);
    const totalPages = Math.ceil(sortedCards.length / limitNum);

    // Format cards with additional fields
    const formattedCards = paginatedCards.map((card) => {
      const daysLeft = differenceInDays(new Date(card.expiryDate), new Date());
      return {
        id: card.id,
        user_id: card.userId,
        issuer: card.issuer,
        label: card.label,
        label_he: card.labelHe,
        code_last4: card.codeLast4,
        value_initial: Number(card.valueInitial),
        value_current: Number(card.valueCurrent),
        currency: card.currency,
        expiry_date: format(new Date(card.expiryDate), 'yyyy-MM-dd'),
        days_until_expiry: daysLeft,
        status: card.status,
        status_color: getStatusColor(daysLeft, card.status),
        notes: card.notes,
        photo_url: card.photoUrl,
        last_balance_update: card.lastBalanceUpdate,
        created_at: card.createdAt,
        updated_at: card.updatedAt,
      };
    });

    sendSuccess(res, {
      cards: formattedCards,
      pagination: {
        current_page: pageNum,
        total_pages: totalPages,
        total_items: sortedCards.length,
        items_per_page: limitNum,
      },
      summary: {
        total_active_value: stats.totalActiveValue,
        active_cards_count: stats.activeCards,
        expiring_soon_count: stats.expiringSoon,
        expired_count: stats.expiredCards,
        used_count: stats.usedCards,
      },
    });
  } catch (error: any) {
    sendError(res, 'INTERNAL_SERVER_ERROR', error.message, 500);
  }
};

export const getCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const card = await cardService.getCardById(req.params.id, req.userId!);
    const daysLeft = differenceInDays(new Date(card.expiryDate), new Date());

    const valueUsed = Number(card.valueInitial) - Number(card.valueCurrent);
    const valueUsedPercentage = (valueUsed / Number(card.valueInitial)) * 100;

    // Format full code as masked
    const fullCodeMasked = card.fullCode
      ? `•••• •••• •••• ${card.codeLast4}`
      : null;

    sendSuccess(res, {
      id: card.id,
      user_id: card.userId,
      issuer: card.issuer,
      label: card.label,
      label_he: card.labelHe,
      code_last4: card.codeLast4,
      full_code_masked: fullCodeMasked,
      value_initial: Number(card.valueInitial),
      value_current: Number(card.valueCurrent),
      value_used: valueUsed,
      value_used_percentage: Math.round(valueUsedPercentage),
      currency: card.currency,
      expiry_date: format(new Date(card.expiryDate), 'yyyy-MM-dd'),
      days_until_expiry: daysLeft,
      status: card.status,
      status_color: getStatusColor(daysLeft, card.status),
      notes: card.notes,
      photo_url: card.photoUrl,
      last_balance_update: card.lastBalanceUpdate,
      created_at: card.createdAt,
      updated_at: card.updatedAt,
      reminders: card.reminders || [],
    });
  } catch (error: any) {
    if (error.message === 'Card not found') {
      sendError(res, 'NOT_FOUND', 'Card not found', 404, {
        resource: 'GiftCard',
        id: req.params.id,
      });
    } else {
      sendError(res, 'INTERNAL_SERVER_ERROR', error.message, 500);
    }
  }
};

export const updateCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const card = await cardService.updateCard(req.params.id, req.userId!, req.body);
    sendSuccess(res, card, 200, 'Gift card updated successfully');
  } catch (error: any) {
    if (error.message === 'Card not found') {
      sendError(res, 'NOT_FOUND', error.message, 404);
    } else {
      sendError(res, 'VALIDATION_ERROR', error.message, 400);
    }
  }
};

export const updateBalance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { new_balance, deduct_amount, change_type, notes, store_name } = req.body;
    
    // Get current card to calculate new balance
    const currentCard = await cardService.getCardById(req.params.id, req.userId!);
    const previousBalance = Number(currentCard.valueCurrent);
    
    let newBalance: number;
    if (deduct_amount) {
      newBalance = previousBalance - deduct_amount;
      if (newBalance < 0) {
        throw new ApiError('Deduct amount exceeds current balance', 400, 'VALIDATION_ERROR');
      }
    } else if (new_balance !== undefined) {
      newBalance = new_balance;
    } else {
      throw new ApiError('Either new_balance or deduct_amount is required', 400, 'VALIDATION_ERROR');
    }

    const updated = await cardService.updateBalance(req.params.id, req.userId!, {
      newBalance,
      changeType: change_type || 'manual_update',
      notes: notes || store_name ? `${store_name ? `Store: ${store_name}. ` : ''}${notes || ''}` : undefined,
    });

    sendSuccess(res, {
      card: {
        id: updated.id,
        value_current: Number(updated.valueCurrent),
        value_used: Number(updated.valueInitial) - Number(updated.valueCurrent),
        last_balance_update: updated.lastBalanceUpdate,
      },
      balance_change: {
        previous: previousBalance,
        new: Number(updated.valueCurrent),
        difference: Number(updated.valueCurrent) - previousBalance,
      },
    }, 200, 'Balance updated successfully');
  } catch (error: any) {
    if (error instanceof ApiError) {
      sendError(res, error.code, error.message, error.statusCode);
    } else {
      sendError(res, 'VALIDATION_ERROR', error.message, 400);
    }
  }
};

export const markAsUsed = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { notes } = req.body;
    const card = await cardService.markAsUsed(req.params.id, req.userId!);
    
    sendSuccess(res, {
      id: card.id,
      value_current: 0,
      status: card.status,
      updated_at: card.updatedAt,
    }, 200, 'Card marked as used. Future reminders cancelled.');
  } catch (error: any) {
    sendError(res, 'VALIDATION_ERROR', error.message, 400);
  }
};

export const deleteCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await cardService.deleteCard(req.params.id, req.userId!);
    sendSuccess(res, null, 200, 'Gift card deleted successfully');
  } catch (error: any) {
    sendError(res, 'NOT_FOUND', error.message, 404);
  }
};

export const getCardFullCode = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const fullCode = await cardService.getCardFullCode(req.params.id, req.userId!);
    sendSuccess(res, {
      full_code: fullCode,
      expires_in: 60, // 60 seconds
    });
  } catch (error: any) {
    sendError(res, 'NOT_FOUND', error.message, 404);
  }
};

export const getWalletStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stats = await cardService.getWalletStats(req.userId!);
    sendSuccess(res, stats);
  } catch (error: any) {
    sendError(res, 'INTERNAL_SERVER_ERROR', error.message, 500);
  }
};
