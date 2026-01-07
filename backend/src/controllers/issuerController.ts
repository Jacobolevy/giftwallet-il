import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendSuccess, sendError } from '../utils/response';

const prisma = new PrismaClient();

export const getAllIssuers = async (req: Request, res: Response): Promise<void> => {
  try {
    const issuers = await prisma.issuer.findMany({
      orderBy: { name: 'asc' },
    });

    const formatted = issuers.map((issuer) => ({
      id: issuer.id,
      name: issuer.name,
      name_he: issuer.nameHe,
      logo_url: issuer.logoUrl,
      brand_color: issuer.brandColor,
      notes: issuer.notes,
    }));

    sendSuccess(res, formatted);
  } catch (error: any) {
    sendError(res, 'INTERNAL_SERVER_ERROR', error.message, 500);
  }
};
