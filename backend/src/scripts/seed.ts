import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const issuers = [
  {
    name: 'BuyMe',
    nameHe: 'ביי-מי',
    websiteUrl: 'https://www.buyme.co.il',
    logoUrl: '/logos/buyme.png',
    brandColor: '#FF6B35',
    supportPhone: '03-7606060',
    supportEmail: 'support@buyme.co.il',
  },
  {
    name: 'Max',
    nameHe: 'מקס',
    websiteUrl: 'https://www.max.co.il',
    logoUrl: '/logos/max.png',
    brandColor: '#E31E24',
    supportPhone: '03-6116111',
    supportEmail: 'service@max.co.il',
  },
  {
    name: 'Dreamcard',
    nameHe: 'דרימקארד',
    websiteUrl: 'https://www.dreamcard.co.il',
    logoUrl: '/logos/dreamcard.png',
    brandColor: '#7B2CBF',
    supportPhone: '03-9009000',
    supportEmail: 'info@dreamcard.co.il',
  },
  {
    name: 'Tav Tzahav',
    nameHe: 'תו זהב',
    websiteUrl: 'https://www.tav-tzahav.co.il',
    logoUrl: '/logos/tav-tzahav.png',
    brandColor: '#FFD700',
    supportPhone: '03-6116111',
    supportEmail: 'service@tav-tzahav.co.il',
  },
  {
    name: 'Other',
    nameHe: 'אחר',
    brandColor: '#6B7280',
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  for (const issuer of issuers) {
    const existing = await prisma.issuer.findFirst({
      where: { name: issuer.name },
    });

    if (existing) {
      console.log(`⏭️  Issuer ${issuer.name} already exists, skipping...`);
      continue;
    }

    await prisma.issuer.create({
      data: issuer,
    });

    console.log(`✅ Created issuer: ${issuer.name}`);
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

