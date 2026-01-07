import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // -------------------------
  // ISSUERS
  // -------------------------
  const issuersData = [
    { id: "buyme", name: "Buyme", websiteUrl: "https://buyme.co.il/", logoUrl: "https://buyme.co.il/logo.png" },
    { id: "max", name: "Max", websiteUrl: "https://www.max.co.il/", logoUrl: "https://www.max.co.il/logo.png" },
    { id: "cibus", name: "Cibus", websiteUrl: "https://www.cibus.co.il/" },
    { id: "cal", name: "CAL", websiteUrl: "https://www.cal.co.il/" },
    { id: "gomarket", name: "GoMarket", websiteUrl: "https://www.gomarket.co.il/" },
    { id: "superpharm", name: "Super-Pharm", websiteUrl: "https://www.superpharm.co.il" },
    { id: "aroma", name: "Aroma", websiteUrl: "https://www.aroma.co.il" },
  ];

  for (const i of issuersData) {
    await prisma.issuer.upsert({
      where: { id: i.id },
      update: {},
      create: i,
    });
  }

  // -------------------------
  // STORES
  // -------------------------
  const storesData = [
    { id: "ikea", name: "IKEA", category: "home", websiteUrl: "https://www.ikea.co.il" },
    { id: "fox", name: "Fox", category: "fashion", websiteUrl: "https://www.fox.co.il" },
    { id: "castro", name: "Castro", category: "fashion", websiteUrl: "https://www.castro.co.il" },
    { id: "shufersal", name: "Shufersal", category: "food", websiteUrl: "https://www.shufersal.co.il" },
    { id: "superpharm", name: "Super-Pharm", category: "pharmacy", websiteUrl: "https://www.superpharm.co.il" },
    { id: "aroma", name: "Aroma", category: "food", websiteUrl: "https://www.aroma.co.il" },
    { id: "wolt", name: "Wolt", category: "food", websiteUrl: "https://wolt.com" },
  ];

  for (const s of storesData) {
    await prisma.store.upsert({
      where: { id: s.id },
      update: {},
      create: s,
    });
  }

  // -------------------------
  // CARD PRODUCTS
  // -------------------------
  const cardProductsData = [
    { id: "buyme-digital", issuerId: "buyme", name: "Buyme Digital", description: "Gift card digital Buyme", sourceUrl: "https://buyme.co.il/giftcards" },
    { id: "buyme-food", issuerId: "buyme", name: "Buyme Food", description: "Gift card para restaurantes", sourceUrl: "https://buyme.co.il/food" },
    { id: "buyme-fashion", issuerId: "buyme", name: "Buyme Fashion", description: "Gift card para moda", sourceUrl: "https://buyme.co.il/fashion" },
    { id: "max-shopping", issuerId: "max", name: "Max Shopping", description: "Gift card Max fashion", sourceUrl: "https://www.max.co.il/giftcards" },
    { id: "cibus-food", issuerId: "cibus", name: "Cibus Food", description: "Gift card supermercados y restaurantes", sourceUrl: "https://www.cibus.co.il/giftcards" },
    { id: "cal-mall", issuerId: "cal", name: "CAL Mall", description: "Gift card CAL centros comerciales", sourceUrl: "https://www.cal.co.il/giftcards" },
    { id: "gomarket-shopping", issuerId: "gomarket", name: "GoMarket Shopping", description: "Gift card GoMarket", sourceUrl: "https://www.gomarket.co.il/giftcards" },
  ];

  for (const cp of cardProductsData) {
    await prisma.cardProduct.upsert({
      where: { id: cp.id },
      update: { lastVerifiedAt: new Date() },
      create: { ...cp, lastVerifiedAt: new Date() },
    });
  }

  // -------------------------
  // CARD PRODUCT STORES
  // -------------------------
  const cardProductStoresData = [
    { cardProductId: "buyme-digital", storeId: "ikea", type: "physical" },
    { cardProductId: "buyme-digital", storeId: "fox", type: "both" },
    { cardProductId: "buyme-digital", storeId: "shufersal", type: "physical" },

    { cardProductId: "buyme-food", storeId: "shufersal", type: "physical" },
    { cardProductId: "buyme-food", storeId: "superpharm", type: "physical" },
    { cardProductId: "buyme-food", storeId: "aroma", type: "both" },
    { cardProductId: "buyme-food", storeId: "wolt", type: "online" },

    { cardProductId: "buyme-fashion", storeId: "fox", type: "physical" },
    { cardProductId: "buyme-fashion", storeId: "castro", type: "physical" },

    { cardProductId: "max-shopping", storeId: "fox", type: "physical" },
    { cardProductId: "max-shopping", storeId: "castro", type: "physical" },

    { cardProductId: "cibus-food", storeId: "shufersal", type: "physical" },
    { cardProductId: "cibus-food", storeId: "aroma", type: "both" },

    { cardProductId: "cal-mall", storeId: "ikea", type: "physical" },
    { cardProductId: "cal-mall", storeId: "shufersal", type: "both" },
  ];

  for (const cps of cardProductStoresData) {
    await prisma.cardProductStore.upsert({
      where: { cardProductId_storeId: { cardProductId: cps.cardProductId, storeId: cps.storeId } },
      update: {},
      create: cps,
    });
  }

  console.log("✅ Seed exacto insertado. Puedes añadir más sin romper nada.");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
