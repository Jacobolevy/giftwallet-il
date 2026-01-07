import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendSuccess, sendError } from '../utils/response';

const prisma = new PrismaClient();

export const getAllIssuers = async (req: Request, res: Response): Promise<void> => {
  try {
    const issuers = await prisma.issuer.findMany({
      orderBy: { name: 'asc' },
      include: {
        products: {
          orderBy: { name: 'asc' },
          select: {
            id: true,
            name: true,
            description: true,
            sourceUrl: true,
            lastVerifiedAt: true,
          },
        },
      },
    });

    sendSuccess(
      res,
      issuers.map((issuer) => ({
        id: issuer.id,
        name: issuer.name,
        website_url: issuer.websiteUrl,
        logo_url: issuer.logoUrl,
        products: issuer.products.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          source_url: p.sourceUrl,
          last_verified_at: p.lastVerifiedAt,
        })),
      }))
    );
  } catch (error: any) {
    sendError(res, 'INTERNAL_SERVER_ERROR', error.message, 500);
  }
};
