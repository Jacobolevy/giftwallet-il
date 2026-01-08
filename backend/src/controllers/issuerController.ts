import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendSuccess, sendError } from '../utils/response';

const prisma = new PrismaClient();

export const getAllIssuers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, page, limit } = req.query;
    const pageNum = page ? parseInt(page as string) : 1;
    const limitNum = limit ? parseInt(limit as string) : 50;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (name) {
      where.name = { contains: name as string, mode: 'insensitive' };
    }

    const [issuers, total] = await Promise.all([
      prisma.issuer.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limitNum,
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
      }),
      prisma.issuer.count({ where }),
    ]);

    sendSuccess(
      res,
      {
        data: issuers.map((issuer) => ({
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
    sendError(res, 'INTERNAL_SERVER_ERROR', error.message, 500);
  }
};
