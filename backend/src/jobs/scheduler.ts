import cron from 'node-cron';
import { PrismaClient, CardStatus } from '@prisma/client';
import { sendReminderEmail } from '../services/emailService';
import { isPast, isToday } from 'date-fns';

const prisma = new PrismaClient();

// Run daily at 9:00 AM Israel time (UTC+2/+3)
// Cron: 0 9 * * * (9 AM every day)
// For testing, you can use: */5 * * * * (every 5 minutes)
const DAILY_REMINDER_CRON = '0 9 * * *';

export const startScheduledJobs = () => {
  console.log('📅 Setting up scheduled jobs...');

  // Daily reminder job
  cron.schedule(DAILY_REMINDER_CRON, async () => {
    console.log('⏰ Running daily reminder job...');
    await processReminders();
    await expireOldCards();
  }, {
    timezone: process.env.TZ || 'Asia/Jerusalem',
  });

  console.log('✅ Scheduled jobs configured');
};

const processReminders = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find due reminders
    const dueReminders = await prisma.reminder.findMany({
      where: {
        reminderDate: {
          lte: today,
        },
        sentFlag: false,
      },
      include: {
        giftCard: {
          include: {
            issuer: true,
          },
        },
        user: true,
      },
    });

    console.log(`Found ${dueReminders.length} due reminders`);

    for (const reminder of dueReminders) {
      // Only send if card is still active
      if (reminder.giftCard.status !== CardStatus.active) {
        // Mark as sent to avoid retrying
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: {
            sentFlag: true,
            sentAt: new Date(),
          },
        });
        continue;
      }

      try {
        await sendReminderEmail(reminder.id, reminder.giftcardId, reminder.userId);
        
        // Mark as sent
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: {
            sentFlag: true,
            sentAt: new Date(),
          },
        });
      } catch (error) {
        console.error(`Failed to send reminder ${reminder.id}:`, error);
        // Don't mark as sent if email failed - will retry tomorrow
      }
    }

    console.log('✅ Reminder processing complete');
  } catch (error) {
    console.error('Error processing reminders:', error);
  }
};

const expireOldCards = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find cards that expired
    const expiredCards = await prisma.giftCard.updateMany({
      where: {
        expiryDate: {
          lt: today,
        },
        status: CardStatus.active,
      },
      data: {
        status: CardStatus.expired,
      },
    });

    console.log(`✅ Expired ${expiredCards.count} cards`);

    // Optionally send expiry notifications
    // This could be implemented similarly to reminders
  } catch (error) {
    console.error('Error expiring cards:', error);
  }
};

