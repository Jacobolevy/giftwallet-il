import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';
import { differenceInDays, format } from 'date-fns';

const prisma = new PrismaClient();

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

const createTransporter = () => {
  const config: EmailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  };

  return nodemailer.createTransport(config);
};

const translations = {
  en: {
    reminder_subject: (issuerName: string) => `⏰ Reminder: Your ${issuerName} gift card is expiring soon`,
    reminder_body: (cardLabel: string, issuerName: string, expiryDate: string, daysLeft: number, currentValue: number) => `
      <h2>Gift Card Expiry Reminder</h2>
      <p>Hello,</p>
      <p>This is a friendly reminder that your gift card is expiring soon:</p>
      <div style="background: linear-gradient(135deg, #2563eb, #1e40af); padding: 20px; border-radius: 12px; color: white; margin: 20px 0;">
        <h3>${cardLabel}</h3>
        <p style="font-size: 24px; margin: 10px 0;"><strong>₪${currentValue}</strong></p>
        <p>Expires: ${expiryDate}</p>
        <p><strong>${daysLeft} days remaining</strong></p>
      </div>
      <p>Don't forget to use your card before it expires!</p>
      <p><a href="${process.env.FRONTEND_URL}/cards/${'{cardId}'}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">View Card Details</a></p>
      <hr />
      <p style="color: #6b7280; font-size: 12px;">
        GiftWallet IL - Your gift card organizer<br>
        <a href="${process.env.FRONTEND_URL}">Open App</a> | 
        <a href="${process.env.FRONTEND_URL}/profile">Notification Settings</a>
      </p>
    `,
  },
  he: {
    reminder_subject: (issuerName: string) => `⏰ תזכורת: כרטיס המתנה ${issuerName} שלך פג תוקף בקרוב`,
    reminder_body: (cardLabel: string, issuerName: string, expiryDate: string, daysLeft: number, currentValue: number) => `
      <h2>תזכורת פג תוקף כרטיס מתנה</h2>
      <p>שלום,</p>
      <p>זוהי תזכורת ידידותית שכרטיס המתנה שלך פג תוקף בקרוב:</p>
      <div style="background: linear-gradient(135deg, #2563eb, #1e40af); padding: 20px; border-radius: 12px; color: white; margin: 20px 0;">
        <h3>${cardLabel}</h3>
        <p style="font-size: 24px; margin: 10px 0;"><strong>₪${currentValue}</strong></p>
        <p>פג תוקף: ${expiryDate}</p>
        <p><strong>נותרו ${daysLeft} ימים</strong></p>
      </div>
      <p>אל תשכח להשתמש בכרטיס שלך לפני שהוא פג תוקף!</p>
      <p><a href="${process.env.FRONTEND_URL}/cards/${'{cardId}'}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">צפה בפרטי הכרטיס</a></p>
      <hr />
      <p style="color: #6b7280; font-size: 12px;">
        GiftWallet IL - מארגן כרטיסי המתנה שלך<br>
        <a href="${process.env.FRONTEND_URL}">פתח אפליקציה</a> | 
        <a href="${process.env.FRONTEND_URL}/profile">הגדרות התראות</a>
      </p>
    `,
  },
};

export const sendReminderEmail = async (
  reminderId: string,
  cardId: string,
  userId: string
): Promise<void> => {
  try {
    const reminder = await prisma.reminder.findUnique({
      where: { id: reminderId },
      include: {
        giftCard: {
          include: {
            issuer: true,
          },
        },
        user: true,
      },
    });

    if (!reminder || !reminder.giftCard || !reminder.user) {
      throw new Error('Reminder not found');
    }

    if (!reminder.user.emailNotificationsEnabled) {
      console.log(`Email notifications disabled for user ${userId}`);
      return;
    }

    const lang = reminder.user.languagePreference;
    const t = translations[lang];

    const daysLeft = differenceInDays(reminder.giftCard.expiryDate, new Date());
    const expiryDate = format(reminder.giftCard.expiryDate, 'dd/MM/yyyy');
    
    const cardLabel = lang === 'he' && reminder.giftCard.labelHe
      ? reminder.giftCard.labelHe
      : reminder.giftCard.label;
    
    const issuerName = lang === 'he' && reminder.giftCard.issuer.nameHe
      ? reminder.giftCard.issuer.nameHe
      : reminder.giftCard.issuer.name;

    const subject = t.reminder_subject(issuerName);
    const body = t.reminder_body(
      cardLabel,
      issuerName,
      expiryDate,
      daysLeft,
      Number(reminder.giftCard.valueCurrent)
    ).replace('{cardId}', cardId);

    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'GiftWallet IL'}" <${process.env.EMAIL_FROM}>`,
      to: reminder.user.email,
      subject,
      html: body,
      text: body.replace(/<[^>]*>/g, ''), // Plain text version
    });

    console.log(`Reminder email sent to ${reminder.user.email} for card ${cardId}`);
  } catch (error) {
    console.error('Error sending reminder email:', error);
    throw error;
  }
};

