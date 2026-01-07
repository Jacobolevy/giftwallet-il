import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';
import { sendSuccess, sendError } from '../utils/response';
import { differenceInDays } from 'date-fns';

const prisma = new PrismaClient();

export const getReminders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sent, card_id, upcoming } = req.query;

    const where: any = { userId: req.userId };

    if (sent === 'true') {
      where.sentFlag = true;
    } else if (sent === 'false') {
      where.sentFlag = false;
    }

    if (card_id) {
      where.giftcardId = card_id;
    }

    if (upcoming === 'true') {
      where.reminderDate = {
        gte: new Date(),
      };
    }

    const reminders = await prisma.reminder.findMany({
      where,
      include: {
        giftCard: {
          include: {
            issuer: true,
          },
        },
      },
      orderBy: {
        reminderDate: 'asc',
      },
    });

    const formattedReminders = reminders.map(reminder => {
      const daysUntilReminder = differenceInDays(
        reminder.reminderDate,
        new Date()
      );

      return {
        id: reminder.id,
        card: {
          id: reminder.giftCard.id,
          label: reminder.giftCard.label,
          label_he: reminder.giftCard.labelHe,
          code_last4: reminder.giftCard.codeLast4,
          value_current: Number(reminder.giftCard.valueCurrent),
          expiry_date: reminder.giftCard.expiryDate,
        },
        reminder_date: reminder.reminderDate,
        type: reminder.type,
        days_until_reminder: daysUntilReminder,
        sent_flag: reminder.sentFlag,
        sent_at: reminder.sentAt,
        created_at: reminder.createdAt,
      };
    });

    const pending = reminders.filter(r => !r.sentFlag).length;
    const sentCount = reminders.filter(r => r.sentFlag).length;
    const upcoming7Days = reminders.filter(r => {
      const days = differenceInDays(r.reminderDate, new Date());
      return days >= 0 && days <= 7 && !r.sentFlag;
    }).length;

    sendSuccess(res, {
      reminders: formattedReminders,
      summary: {
        total: reminders.length,
        pending,
        sent: sentCount,
        upcoming_7_days: upcoming7Days,
      },
    });
  } catch (error: any) {
    sendError(res, 'INTERNAL_SERVER_ERROR', error.message, 500);
  }
};

export const getReminder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reminder = await prisma.reminder.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
      include: {
        giftCard: {
          include: {
            issuer: true,
          },
        },
      },
    });

    if (!reminder) {
      sendError(res, 'NOT_FOUND', 'Reminder not found', 404);
      return;
    }

    sendSuccess(res, reminder);
  } catch (error: any) {
    sendError(res, 'INTERNAL_SERVER_ERROR', error.message, 500);
  }
};

export const markReminderRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reminder = await prisma.reminder.update({
      where: { id: req.params.id },
      data: {
        sentFlag: true,
        sentAt: new Date(),
      },
    });

    sendSuccess(res, reminder);
  } catch (error: any) {
    sendError(res, 'VALIDATION_ERROR', error.message, 400);
  }
};
