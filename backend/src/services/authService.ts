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
 * Dev-only helper for local testing/demo UI.
 * Creates a deterministic demo user if missing and returns a valid JWT.
 */
export const devLogin = async () => {
  const demoEmail = process.env.DEV_LOGIN_EMAIL || 'demo@giftwallet.local';
  const demoPassword = process.env.DEV_LOGIN_PASSWORD || 'demo-password-change-me';

  const existingUser = await prisma.user.findUnique({
    where: { email: demoEmail },
  });

  const userRecord =
    existingUser ??
    (await prisma.user.create({
      data: {
        email: demoEmail,
        passwordHash: await bcrypt.hash(demoPassword, 12),
        name: 'Demo User',
        languagePreference: Language.he,
      },
    }));

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

