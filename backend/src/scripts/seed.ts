import { PrismaClient, StoreAccessType } from '@prisma/client';

const prisma = new PrismaClient();

type SeedIssuer = {
  name: string;
  websiteUrl?: string;
  logoUrl?: string;
  products: Array<{
    name: string;
    description?: string;
    sourceUrl: string;
    stores: Array<{ name: string; type?: StoreAccessType }>;
  }>;
};

const storesCatalog: Array<{ name: string; category?: string; websiteUrl?: string }> = [
  { name: 'Castro', category: 'fashion' },
  { name: 'Fox', category: 'fashion' },
  { name: 'H&M', category: 'fashion' },
  { name: 'Zara', category: 'fashion' },
  { name: 'Golf', category: 'fashion' },
  { name: 'Bug', category: 'electronics' },
  { name: 'KSP', category: 'electronics' },
  { name: 'Ivory', category: 'electronics' },
  { name: 'iDigital', category: 'electronics' },
  { name: 'IKEA', category: 'home' },
  { name: 'Ace', category: 'home' },
  { name: 'Home Center', category: 'home' },
  { name: 'Aroma', category: 'food' },
  { name: 'Cafe Cafe', category: 'food' },
  { name: 'McDonalds', category: 'food' },
  { name: 'Shufersal', category: 'supermarket' },
  { name: 'Rami Levy', category: 'supermarket' },
  { name: 'Victory', category: 'supermarket' },
  { name: 'Super-Pharm', category: 'beauty' },
  { name: 'Be', category: 'beauty' },
];

const issuers: SeedIssuer[] = [
  {
    name: 'BuyMe',
    websiteUrl: 'https://www.buyme.co.il',
    logoUrl: '/logos/buyme.png',
    products: [
      {
        name: 'BuyMe Fashion',
        description: 'Valid in fashion brands that participate in BuyMe.',
        sourceUrl: 'https://www.buyme.co.il',
        stores: [
          { name: 'Castro' },
          { name: 'Fox' },
          { name: 'H&M' },
          { name: 'Zara' },
          { name: 'Golf' },
        ],
      },
      {
        name: 'BuyMe Tech',
        description: 'Valid in electronics stores that participate in BuyMe.',
        sourceUrl: 'https://www.buyme.co.il',
        stores: [{ name: 'Bug' }, { name: 'KSP' }, { name: 'Ivory' }, { name: 'iDigital' }],
      },
      {
        name: 'BuyMe Food',
        description: 'Valid in restaurants/coffee chains that participate in BuyMe.',
        sourceUrl: 'https://www.buyme.co.il',
        stores: [{ name: 'Aroma' }, { name: 'Cafe Cafe' }, { name: 'McDonalds' }],
      },
    ],
  },
  {
    name: 'Max',
    websiteUrl: 'https://www.max.co.il',
    logoUrl: '/logos/max.png',
    products: [
      {
        name: 'Max Gift Fashion',
        sourceUrl: 'https://www.max.co.il',
        stores: [{ name: 'Castro' }, { name: 'Fox' }, { name: 'Golf' }],
      },
      {
        name: 'Max Gift Home',
        sourceUrl: 'https://www.max.co.il',
        stores: [{ name: 'Ace' }, { name: 'Home Center' }, { name: 'IKEA' }],
      },
    ],
  },
  {
    name: 'Dreamcard',
    websiteUrl: 'https://www.dreamcard.co.il',
    logoUrl: '/logos/dreamcard.png',
    products: [
      {
        name: 'Dreamcard Supermarket',
        sourceUrl: 'https://www.dreamcard.co.il',
        stores: [{ name: 'Shufersal' }, { name: 'Rami Levy' }, { name: 'Victory' }],
      },
      {
        name: 'Dreamcard Beauty',
        sourceUrl: 'https://www.dreamcard.co.il',
        stores: [{ name: 'Super-Pharm' }, { name: 'Be' }],
      },
    ],
  },
];

async function main() {
  console.log('🌱 Seeding database (Issuer/CardProduct/Store)...');

  // Stores
  const storeIdByName = new Map<string, string>();
  for (const s of storesCatalog) {
    const existing = await prisma.store.findFirst({ where: { name: s.name } });
    const store = existing
      ? existing
      : await prisma.store.create({
          data: {
            name: s.name,
            category: s.category,
            websiteUrl: s.websiteUrl,
          },
        });
    storeIdByName.set(store.name, store.id);
  }
  console.log(`✅ Stores ready: ${storeIdByName.size}`);

  // Issuers + CardProducts + join table
  for (const issuerSeed of issuers) {
    const issuer =
      (await prisma.issuer.findFirst({ where: { name: issuerSeed.name } })) ||
      (await prisma.issuer.create({
        data: {
          name: issuerSeed.name,
          websiteUrl: issuerSeed.websiteUrl,
          logoUrl: issuerSeed.logoUrl,
        },
      }));

    for (const productSeed of issuerSeed.products) {
      const cardProduct =
        (await prisma.cardProduct.findFirst({
          where: { issuerId: issuer.id, name: productSeed.name },
        })) ||
        (await prisma.cardProduct.create({
          data: {
            issuerId: issuer.id,
            name: productSeed.name,
            description: productSeed.description,
            sourceUrl: productSeed.sourceUrl,
            lastVerifiedAt: new Date(),
          },
        }));

      for (const storeRef of productSeed.stores) {
        const storeId = storeIdByName.get(storeRef.name);
        if (!storeId) continue;

        await prisma.cardProductStore.upsert({
          where: { cardProductId_storeId: { cardProductId: cardProduct.id, storeId } },
          update: { type: storeRef.type ?? StoreAccessType.both },
          create: { cardProductId: cardProduct.id, storeId, type: storeRef.type ?? StoreAccessType.both },
        });
      }
    }
  }

  console.log('✅ Seed complete');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

