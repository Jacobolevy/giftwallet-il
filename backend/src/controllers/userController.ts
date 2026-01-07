import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';
import { changePassword as changePasswordService } from '../services/authService';
import { sendSuccess, sendError } from '../utils/response';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        languagePreference: true,
        emailNotificationsEnabled: true,
        pushNotificationsEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      sendError(res, 'NOT_FOUND', 'User not found', 404);
      return;
    }

    sendSuccess(res, user);
  } catch (error: any) {
    sendError(res, 'INTERNAL_SERVER_ERROR', error.message, 500);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, phone, language_preference, email_notifications_enabled, push_notifications_enabled } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        name,
        phone,
        languagePreference: language_preference,
        emailNotificationsEnabled: email_notifications_enabled,
        pushNotificationsEnabled: push_notifications_enabled,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        languagePreference: true,
        emailNotificationsEnabled: true,
        pushNotificationsEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    sendSuccess(res, user);
  } catch (error: any) {
    sendError(res, 'VALIDATION_ERROR', error.message, 400);
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { current_password, new_password, confirm_password } = req.body;
    
    if (new_password !== confirm_password) {
      sendError(res, 'VALIDATION_ERROR', 'New password and confirmation do not match', 400);
      return;
    }

    await changePasswordService(req.userId!, current_password, new_password);
    sendSuccess(res, null, 200, 'Password updated successfully');
  } catch (error: any) {
    if (error.message.includes('incorrect')) {
      sendError(res, 'UNAUTHORIZED', error.message, 401);
    } else {
      sendError(res, 'VALIDATION_ERROR', error.message, 400);
    }
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { password, confirmation } = req.body;

    if (confirmation !== 'DELETE MY ACCOUNT') {
      sendError(res, 'VALIDATION_ERROR', 'Confirmation text must be exactly "DELETE MY ACCOUNT"', 400);
      return;
    }

    // Verify password
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });
    
    if (!user) {
      sendError(res, 'NOT_FOUND', 'User not found', 404);
      return;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isValid) {
      sendError(res, 'UNAUTHORIZED', 'Invalid password', 401);
      return;
    }

    // Delete user (cascade will delete cards, reminders, etc.)
    await prisma.user.delete({
      where: { id: req.userId },
    });

    sendSuccess(res, null, 200, 'Account deleted successfully');
  } catch (error: any) {
    sendError(res, 'INTERNAL_SERVER_ERROR', error.message, 500);
  }
};

export const exportData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { format = 'json' } = req.query;

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        giftCards: {
          include: {
            issuer: true,
            balanceHistory: {
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        },
        reminders: {
          include: {
            giftCard: {
              include: {
                issuer: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      sendError(res, 'NOT_FOUND', 'User not found', 404);
      return;
    }

    const exportData = {
      user: {
        email: user.email,
        name: user.name,
        phone: user.phone,
        languagePreference: user.languagePreference,
        createdAt: user.createdAt,
      },
      gift_cards: user.giftCards.map(card => ({
        issuer: card.issuer.name,
        label: card.label,
        label_he: card.labelHe,
        code_last4: card.codeLast4,
        value_initial: Number(card.valueInitial),
        value_current: Number(card.valueCurrent),
        expiry_date: card.expiryDate,
        status: card.status,
        notes: card.notes,
        created_at: card.createdAt,
        balance_history: card.balanceHistory.map(h => ({
          previous_balance: Number(h.previousBalance),
          new_balance: Number(h.newBalance),
          change_amount: Number(h.changeAmount),
          change_type: h.changeType,
          notes: h.notes,
          created_at: h.createdAt,
        })),
      })),
      reminders: user.reminders.map(r => ({
        reminder_date: r.reminderDate,
        type: r.type,
        sent_flag: r.sentFlag,
        sent_at: r.sentAt,
        card_label: r.giftCard.label,
      })),
      exported_at: new Date().toISOString(),
    };

    if (format === 'csv') {
      // TODO: Implement CSV export
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="giftwallet-export-${Date.now()}.csv"`);
      // For now, return JSON
      sendSuccess(res, exportData);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="giftwallet-export-${Date.now()}.json"`);
      sendSuccess(res, exportData);
    }
  } catch (error: any) {
    sendError(res, 'INTERNAL_SERVER_ERROR', error.message, 500);
  }
};
