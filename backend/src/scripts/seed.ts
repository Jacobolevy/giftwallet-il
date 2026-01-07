import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const issuers = [
  {
    name: 'BuyMe',
    nameHe: 'ביי-מי',
    logoUrl: '/logos/buyme.png',
    brandColor: '#FF6B35',
  },
  {
    name: 'Max',
    nameHe: 'מקס',
    logoUrl: '/logos/max.png',
    brandColor: '#E31E24',
  },
  {
    name: 'Dreamcard',
    nameHe: 'דרימקארד',
    logoUrl: '/logos/dreamcard.png',
    brandColor: '#7B2CBF',
  },
  {
    name: 'Tav Tzahav',
    nameHe: 'תו זהב',
    logoUrl: '/logos/tav-tzahav.png',
    brandColor: '#FFD700',
  },
  {
    name: 'Other',
    nameHe: 'אחר',
    brandColor: '#6B7280',
  },
];

// Establishments that accept gift cards
const establishments = [
  { name: 'Castro', nameHe: 'קסטרו' },
  { name: 'Fox', nameHe: 'פוקס' },
  { name: 'H&M', nameHe: 'H&M' },
  { name: 'Zara', nameHe: 'זארה' },
  { name: 'Golf', nameHe: 'גולף' },
  { name: 'Renuar', nameHe: 'רנואר' },
  { name: 'Honigman', nameHe: 'הוניגמן' },
  { name: 'American Eagle', nameHe: 'אמריקן איגל' },
  { name: 'Pull & Bear', nameHe: 'פול אנד בר' },
  { name: 'Massimo Dutti', nameHe: 'מסימו דוטי' },
  { name: 'Bug', nameHe: 'באג' },
  { name: 'KSP', nameHe: 'KSP' },
  { name: 'iDigital', nameHe: 'איי-דיגיטל' },
  { name: 'Ivory', nameHe: 'איבורי' },
  { name: 'Office Depot', nameHe: 'אופיס דיפו' },
  { name: 'IKEA', nameHe: 'איקאה' },
  { name: 'Ace', nameHe: 'אייס' },
  { name: 'Home Center', nameHe: 'הום סנטר' },
  { name: 'Keter', nameHe: 'כתר' },
  { name: 'Hamashbir', nameHe: 'המשביר' },
  { name: 'Aroma', nameHe: 'ארומה' },
  { name: 'Cafe Cafe', nameHe: 'קפה קפה' },
  { name: 'Landwer', nameHe: 'לנדוור' },
  { name: 'Greg', nameHe: 'גרג' },
  { name: 'Arcaffe', nameHe: 'ארקפה' },
  { name: 'McDonalds', nameHe: 'מקדונלדס' },
  { name: 'BBB', nameHe: 'BBB' },
  { name: 'Moses', nameHe: 'מוזס' },
  { name: 'Shufersal', nameHe: 'שופרסל' },
  { name: 'Rami Levy', nameHe: 'רמי לוי' },
  { name: 'Victory', nameHe: 'ויקטורי' },
  { name: 'Yochananof', nameHe: 'יוחננוף' },
  { name: 'Super-Pharm', nameHe: 'סופר-פארם' },
  { name: 'Be', nameHe: 'Be' },
  { name: 'MAC', nameHe: 'מאק' },
  { name: 'Kiehl\'s', nameHe: 'קיאלס' },
  { name: 'L\'Occitane', nameHe: 'לאוקסיטן' },
];

// Mapping of which issuers work at which establishments
// This is sample data - in reality this would come from issuer documentation
const issuerEstablishmentMappings: Record<string, string[]> = {
  'BuyMe': [
    'Castro', 'Fox', 'H&M', 'Zara', 'Golf', 'Renuar', 'Honigman',
    'Bug', 'KSP', 'iDigital', 'Ivory',
    'IKEA', 'Ace', 'Home Center', 'Keter', 'Hamashbir',
    'Aroma', 'Cafe Cafe', 'Landwer', 'Greg', 'Arcaffe', 'McDonalds', 'BBB', 'Moses',
    'Super-Pharm', 'Be', 'MAC', 'Kiehl\'s', 'L\'Occitane',
  ],
  'Max': [
    'Castro', 'Fox', 'Golf', 'Renuar', 'American Eagle', 'Pull & Bear', 'Massimo Dutti',
    'Bug', 'KSP', 'Office Depot',
    'Ace', 'Home Center',
    'Aroma', 'Cafe Cafe', 'Greg',
    'Shufersal', 'Victory',
    'Super-Pharm', 'Be',
  ],
  'Dreamcard': [
    'H&M', 'Zara', 'American Eagle', 'Pull & Bear', 'Massimo Dutti',
    'iDigital', 'Ivory',
    'IKEA', 'Hamashbir',
    'Landwer', 'Arcaffe', 'BBB', 'Moses',
    'Rami Levy', 'Yochananof',
    'MAC', 'Kiehl\'s', 'L\'Occitane',
  ],
  'Tav Tzahav': [
    'Castro', 'Fox', 'H&M', 'Golf', 'Honigman',
    'Bug', 'KSP',
    'Ace', 'Home Center', 'Keter',
    'Aroma', 'Cafe Cafe', 'Landwer', 'McDonalds',
    'Shufersal', 'Rami Levy', 'Victory', 'Yochananof',
    'Super-Pharm',
  ],
};

async function main() {
  console.log('🌱 Seeding database...');

  // Create issuers
  const issuerMap: Record<string, string> = {};
  for (const issuer of issuers) {
    const existing = await prisma.issuer.findFirst({
      where: { name: issuer.name },
    });

    if (existing) {
      console.log(`⏭️  Issuer ${issuer.name} already exists, skipping...`);
      issuerMap[issuer.name] = existing.id;
      continue;
    }

    const created = await prisma.issuer.create({
      data: issuer,
    });
    issuerMap[issuer.name] = created.id;
    console.log(`✅ Created issuer: ${issuer.name}`);
  }

  // Create establishments
  const establishmentMap: Record<string, string> = {};
  for (const establishment of establishments) {
    const existing = await prisma.establishment.findFirst({
      where: { name: establishment.name },
    });

    if (existing) {
      console.log(`⏭️  Establishment ${establishment.name} already exists, skipping...`);
      establishmentMap[establishment.name] = existing.id;
      continue;
    }

    const created = await prisma.establishment.create({
      data: establishment,
    });
    establishmentMap[establishment.name] = created.id;
    console.log(`✅ Created establishment: ${establishment.name}`);
  }

  // Create issuer-establishment relationships
  for (const [issuerName, establishmentNames] of Object.entries(issuerEstablishmentMappings)) {
    const issuerId = issuerMap[issuerName];
    if (!issuerId) {
      console.log(`⚠️  Issuer ${issuerName} not found, skipping mappings...`);
      continue;
    }

    for (const establishmentName of establishmentNames) {
      const establishmentId = establishmentMap[establishmentName];
      if (!establishmentId) {
        console.log(`⚠️  Establishment ${establishmentName} not found, skipping...`);
        continue;
      }

      const existing = await prisma.issuerEstablishment.findFirst({
        where: {
          issuerId,
          establishmentId,
        },
      });

      if (existing) {
        continue; // Already exists
      }

      await prisma.issuerEstablishment.create({
        data: {
          issuerId,
          establishmentId,
        },
      });
    }
    console.log(`✅ Created mappings for issuer: ${issuerName}`);
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

