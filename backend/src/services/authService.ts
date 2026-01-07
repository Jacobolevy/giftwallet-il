import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient, Language } from '@prisma/client';

const prisma = new PrismaClient();

export interface SignupData {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  languagePreference?: Language;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface DevLoginData {
  email?: string;
  name?: string;
  languagePreference?: Language;
}

export const signup = async (data: SignupData) => {
  const { email, password, name, phone, languagePreference = Language.he } = data;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      phone,
      languagePreference,
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      languagePreference: true,
      createdAt: true,
    },
  });

  // Generate token
  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET!,
    { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'] }
  );

  return { user, token };
};

export const login = async (data: LoginData) => {
  const { email, password } = data;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Verify password
  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  // Generate token
  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET!,
    { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'] }
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      languagePreference: user.languagePreference,
    },
    token,
  };
};

/**
 * DEV-only helper to obtain a valid JWT without knowing credentials.
 * Guard usage at the routing/controller level (never enable in production).
 */
export const devLogin = async (data: DevLoginData = {}) => {
  const email = (data.email || process.env.DEV_DEMO_EMAIL || 'demo@giftwallet.local').toLowerCase();
  const name = data.name || 'Demo User';
  const languagePreference = data.languagePreference || Language.he;

  // Ensure demo user exists (password is irrelevant; endpoint bypasses password checks)
  const existing = await prisma.user.findUnique({ where: { email } });
  const userRecord = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: { name, languagePreference },
      })
    : await prisma.user.create({
        data: {
          email,
          passwordHash: await bcrypt.hash(process.env.DEV_DEMO_PASSWORD || 'demo-password-not-used', 12),
          name,
          languagePreference,
        },
      });

  const token = jwt.sign(
    { userId: userRecord.id },
    process.env.JWT_SECRET!,
    { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'] }
  );

  return {
    user: {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
      phone: userRecord.phone,
      languagePreference: userRecord.languagePreference,
    },
    token,
  };
};

export const changePassword = async (userId: string, oldPassword: string, newPassword: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Verify old password
  const isValid = await bcrypt.compare(oldPassword, user.passwordHash);

  if (!isValid) {
    throw new Error('Current password is incorrect');
  }

  // Validate new password
  if (newPassword.length < 8) {
    throw new Error('New password must be at least 8 characters');
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, 12);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return { success: true };
};

