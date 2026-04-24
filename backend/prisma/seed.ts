import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import {
  CouponScope,
  CouponType,
  PrismaClient,
  ProductRegion,
  ProductType,
  UserRole
} from "@prisma/client";
import { productCatalog } from "./catalog.data";

const prisma = new PrismaClient();

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const buildSearchText = (input: {
  name: string;
  description: string;
  shortDescription: string;
  tags: string[];
  platformName: string;
  categoryName: string;
  region: ProductRegion;
}) =>
  (() => {
    const raw = [
      input.name,
      input.description,
      input.shortDescription,
      input.platformName,
      input.categoryName,
      input.region,
      ...input.tags
    ]
      .filter(Boolean)
      .join(" ");

    const normalized = raw
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return `${raw.toLowerCase()} ${normalized}`.trim();
  })();

const encryptValue = (value: string) => {
  const keyHex =
    process.env.AES_ENCRYPTION_KEY ??
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  const key = Buffer.from(keyHex, "hex");
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    ciphertext: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64")
  };
};

const fakeCustomers = [
  { email: "sara@nexus.local", username: "sara_plays", firstName: "Sara", lastName: "Mason", country: "United States" },
  { email: "ryan@nexus.local", username: "ryanxp", firstName: "Ryan", lastName: "Cole", country: "Canada" },
  { email: "amira@nexus.local", username: "amira_arcade", firstName: "Amira", lastName: "Stone", country: "Jordan" },
  { email: "leo@nexus.local", username: "leo_next", firstName: "Leo", lastName: "Ward", country: "United Kingdom" },
  { email: "mia@nexus.local", username: "miaquest", firstName: "Mia", lastName: "Lopez", country: "Spain" },
  { email: "noah@nexus.local", username: "noahpixels", firstName: "Noah", lastName: "Kim", country: "South Korea" }
];

const fakeReviews = [
  { username: "sara_plays", productSlug: "cyberpunk-2077", rating: 5, title: "Fast and clear", body: "The delivery was quick and the page made it very clear that this was the full game as a digital code." },
  { username: "ryanxp", productSlug: "elden-ring", rating: 5, title: "Worked instantly", body: "Redeemed without issues. Much cleaner buying flow than other code stores." },
  { username: "amira_arcade", productSlug: "forza-horizon-5", rating: 5, title: "Very smooth checkout", body: "Loved the clear Xbox labeling and instant order delivery." },
  { username: "leo_next", productSlug: "assassin-s-creed-mirage", rating: 4, title: "Good trust signals", body: "The page explained what I was buying well and the code arrived fast." },
  { username: "miaquest", productSlug: "playstation-store-card-50-usa", rating: 5, title: "Exactly what I needed", body: "Gift card arrived right away. Super easy experience." },
  { username: "noahpixels", productSlug: "xbox-game-pass-ultimate-3-months-global", rating: 5, title: "Subscription worked", body: "Nice clean layout, very premium feeling, and the redemption instructions were easy to follow." },
  { username: "sara_plays", productSlug: "fortnite-v-bucks-5000", rating: 4, title: "Good value", body: "Fast delivery and easy checkout. Would buy again." },
  { username: "ryanxp", productSlug: "nintendo-eshop-card-50-usa", rating: 5, title: "Instant card delivery", body: "Card code was available immediately after checkout." },
  { username: "amira_arcade", productSlug: "playstation-plus-extra-global", rating: 4, title: "Reliable subscription", body: "Everything was clear and the digital code activated correctly." },
  { username: "leo_next", productSlug: "valorant-vp-2050", rating: 5, title: "No confusion at all", body: "The product wording helped me understand exactly what I was purchasing." }
];

async function main() {
  const adminPasswordHash = await bcrypt.hash("Admin@123!", 12);
  const customerPasswordHash = await bcrypt.hash("Player@123!", 12);
  const seenCatalogSlugs = new Set<string>();

  for (const item of productCatalog) {
    const slug = slugify(item.name);
    if (seenCatalogSlugs.has(slug)) {
      throw new Error(`Duplicate product seed slug detected: ${slug}`);
    }
    seenCatalogSlugs.add(slug);
  }

  const admin = await prisma.user.upsert({
    where: { email: "admin@nexus.gg" },
    update: {
      role: UserRole.SUPERADMIN,
      isEmailVerified: true
    },
    create: {
      email: "admin@nexus.gg",
      username: "nexusadmin",
      passwordHash: adminPasswordHash,
      role: UserRole.SUPERADMIN,
      isEmailVerified: true,
      profile: {
        create: {
          firstName: "Nexus",
          lastName: "Admin",
          currency: "USD",
          preferredLanguage: "en"
        }
      },
      cart: {
        create: {}
      }
    }
  });

  for (const customer of fakeCustomers) {
    await prisma.user.upsert({
      where: { email: customer.email },
      update: {
        username: customer.username,
        isEmailVerified: true
      },
      create: {
        email: customer.email,
        username: customer.username,
        passwordHash: customerPasswordHash,
        role: UserRole.CUSTOMER,
        isEmailVerified: true,
        loyaltyPoints: Math.floor(Math.random() * 400),
        balance: Math.floor(Math.random() * 80),
        profile: {
          create: {
            firstName: customer.firstName,
            lastName: customer.lastName,
            country: customer.country,
            currency: "USD",
            preferredLanguage: "en",
            newsletterSubscribed: true
          }
        },
        cart: {
          create: {}
        }
      }
    });
  }

  const categories = [
    {
      name: "PC Games",
      slug: "pc-games",
      description: "Steam, Epic, EA and Ubisoft digital full games."
    },
    {
      name: "Console Games",
      slug: "console-games",
      description: "Xbox, PlayStation and Nintendo digital game delivery."
    },
    {
      name: "Gift Cards",
      slug: "gift-cards",
      description: "Wallet credit, store cards and digital balance top-ups."
    },
    {
      name: "Subscriptions",
      slug: "subscriptions",
      description: "Gaming memberships and recurring premium access."
    },
    {
      name: "In-Game Currency",
      slug: "in-game-currency",
      description: "V-Bucks, Robux, FC Points and other digital currency packs."
    }
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category
    });
  }

  const platforms = [
    { name: "Steam", slug: "steam", color: "#1B2838" },
    { name: "Epic Games", slug: "epic-games", color: "#111111" },
    { name: "Xbox", slug: "xbox", color: "#107C10" },
    { name: "PlayStation", slug: "playstation", color: "#003087" },
    { name: "Nintendo", slug: "nintendo", color: "#E60012" },
    { name: "EA", slug: "ea", color: "#FF5A00" },
    { name: "Ubisoft", slug: "ubisoft", color: "#0066FF" },
    { name: "Netflix", slug: "netflix", color: "#E50914" },
    { name: "Spotify", slug: "spotify", color: "#1DB954" },
    { name: "Discord", slug: "discord", color: "#8B5CF6" }
  ];

  for (const platform of platforms) {
    await prisma.platform.upsert({
      where: { slug: platform.slug },
      update: platform,
      create: platform
    });
  }

  const supplier = await prisma.supplier.upsert({
    where: { name: "NEXUS Direct Supply" },
    update: {},
    create: {
      name: "NEXUS Direct Supply",
      contactEmail: "stock@nexus.gg",
      notes: "Primary single-seller inventory source."
    }
  });

  const legacyWalletSlugs = ["steam-wallet", "playstation-wallet", "xbox-wallet", "nintendo-wallet"].flatMap((name) =>
    ["global", "usa", "uk", "europe", "turkey"].map((region) => `${name}-${region}`)
  );
  const legacyStarterSlugs = [
    "alan-wake-2-epic-full-game",
    "black-myth-wukong-full-game",
    "call-of-duty-points-2400",
    "call-of-duty-points-5000",
    "cities-skylines-ii-pc-code",
    "dragon-s-dogma-2-pc-digital-code",
    "ea-play-12-months",
    "ea-sports-fc-25-pc-code",
    "elden-ring-shadow-bundle",
    "epic-games-wallet-10",
    "fc-points-2800",
    "fc-points-5900",
    "final-fantasy-vii-rebirth-psn",
    "fortnite-13500-v-bucks",
    "fortnite-2800-v-bucks",
    "fortnite-5000-v-bucks",
    "forza-horizon-5-xbox-digital-game",
    "frostpunk-2-pc-digital-code",
    "god-of-war-ragnarok-psn-digital-code",
    "gran-turismo-7-psn",
    "hades-ii-early-access-code",
    "halo-infinite-campaign-xbox",
    "helldivers-2-pc-digital-code",
    "manor-lords-pc-code",
    "marvel-s-spider-man-2-psn-game",
    "nintendo-eshop-20-card",
    "nintendo-eshop-50-card",
    "nintendo-switch-online-12-months",
    "no-rest-for-the-wicked",
    "palworld-pc-full-game",
    "paper-mario-the-thousand-year-door",
    "persona-3-reload-xbox-code",
    "playstation-plus-essential-3-months",
    "playstation-plus-extra-12-months",
    "playstation-store-10-card",
    "playstation-store-20-card",
    "playstation-store-50-card",
    "prince-of-persia-the-lost-crown",
    "princess-peach-showtime",
    "rise-of-the-ronin-psn-code",
    "roblox-2200-robux",
    "roblox-800-robux",
    "sea-of-thieves-deluxe-xbox",
    "senua-s-saga-hellblade-ii",
    "starfield-xbox-full-game",
    "steam-wallet-10",
    "steam-wallet-20",
    "steam-wallet-50",
    "super-mario-bros-wonder-digital-code",
    "the-legend-of-zelda-tears-of-the-kingdom",
    "ubisoft-classics-12-months",
    "valorant-2050-vp",
    "warhammer-40k-space-marine-2",
    "xbox-game-pass-ultimate-1-month",
    "xbox-game-pass-ultimate-3-months",
    "xbox-gift-card-15",
    "xbox-gift-card-25",
    "xbox-gift-card-50"
  ];

  await prisma.product.updateMany({
    where: {
      slug: {
        in: [...legacyWalletSlugs, ...legacyStarterSlugs]
      }
    },
    data: {
      isActive: false
    }
  });

  await prisma.review.deleteMany({
    where: {
      product: {
        slug: {
          in: legacyStarterSlugs
        }
      }
    }
  });

  for (const [index, item] of productCatalog.entries()) {
    const category = await prisma.category.findUniqueOrThrow({ where: { slug: item.categorySlug } });
    const platform = await prisma.platform.findUniqueOrThrow({ where: { slug: item.platformSlug } });
    const slug = slugify(item.name);
    const coverImage = item.coverImageUrl ?? item.thumbnailUrl ?? "";
    const thumbnailImage = item.thumbnailUrl ?? item.coverImageUrl ?? "";
    const rating = Number((4 + (index % 10) * 0.1).toFixed(2));
    const reviewCount = 8 + (index % 18);
    const soldCount = 60 + index * 7;
    const description = `${item.name} from NEXUS with fast delivery, clear platform guidance, and verified digital stock.`;
    const shortDescription = `${item.name} delivered instantly as secure digital access from NEXUS.`;
    const searchText = buildSearchText({
      name: item.name,
      description,
      shortDescription,
      tags: item.tags,
      platformName: platform.name,
      categoryName: category.name,
      region: item.region
    });

    const product = await prisma.product.upsert({
      where: { slug },
      update: {
        name: item.name,
        description,
        shortDescription,
        searchText,
        isActive: true,
        type: item.type,
        platformId: platform.id,
        categoryId: category.id,
        basePrice: item.price,
        salePrice: item.salePrice,
        currency: "USD",
        region: item.region,
        stock: item.stock,
        isFeatured: item.featured ?? false,
        isHot: item.hot ?? false,
        isNew: item.isNew ?? false,
        tags: item.tags,
        coverImageUrl: coverImage,
        thumbnailUrl: thumbnailImage,
        images: [coverImage, thumbnailImage],
        metaTitle: `${item.name} | NEXUS`,
        metaDescription: `Buy ${item.name} instantly from NEXUS.`,
        weight: item.featured ? 10 : item.hot ? 8 : 3,
        rating,
        reviewCount,
        soldCount
      },
      create: {
        name: item.name,
        slug,
        description,
        shortDescription,
        searchText,
        isActive: true,
        type: item.type,
        platformId: platform.id,
        categoryId: category.id,
        basePrice: item.price,
        salePrice: item.salePrice,
        currency: "USD",
        region: item.region,
        stock: item.stock,
        isFeatured: item.featured ?? false,
        isHot: item.hot ?? false,
        isNew: item.isNew ?? false,
        tags: item.tags,
        coverImageUrl: coverImage,
        thumbnailUrl: thumbnailImage,
        images: [coverImage, thumbnailImage],
        metaTitle: `${item.name} | NEXUS`,
        metaDescription: `Buy ${item.name} instantly from NEXUS.`,
        weight: item.featured ? 10 : item.hot ? 8 : 3,
        rating,
        reviewCount,
        soldCount
      }
    });

    if (item.type !== ProductType.BUNDLE) {
      const batch = await prisma.inventoryBatch.upsert({
        where: {
          referenceCode: `BATCH-${slug.toUpperCase().replace(/-/g, "_")}`
        },
        update: {
          notes: `Seed batch for ${item.name}.`
        },
        create: {
          label: `${item.name} launch batch`,
          referenceCode: `BATCH-${slug.toUpperCase().replace(/-/g, "_")}`,
          supplierId: supplier.id,
          importedById: admin.id,
          notes: `Seed batch for ${item.name}.`
        }
      });

      const existingKeyCount = await prisma.productKey.count({
        where: { productId: product.id }
      });

      if (existingKeyCount < item.stock) {
        for (let keyIndex = existingKeyCount + 1; keyIndex <= item.stock; keyIndex += 1) {
          const rawKey = `${slug.toUpperCase().replace(/-/g, "")}-${keyIndex.toString().padStart(4, "0")}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
          const encrypted = encryptValue(rawKey);
          await prisma.productKey.create({
            data: {
              productId: product.id,
              batchId: batch.id,
              checksum: crypto.createHash("sha256").update(rawKey).digest("hex"),
              ...encrypted
            }
          });
        }
      }
    }
  }

  const coupons = [
    { code: "WELCOME10", type: CouponType.PERCENTAGE, value: 10, minOrderAmount: 20 },
    { code: "NEXUS15", type: CouponType.PERCENTAGE, value: 15, minOrderAmount: 50 },
    { code: "SAVE5", type: CouponType.FIXED_AMOUNT, value: 5, minOrderAmount: 25 },
    { code: "SPRING20", type: CouponType.PERCENTAGE, value: 20, minOrderAmount: 80 },
    { code: "HOTDEAL7", type: CouponType.FIXED_AMOUNT, value: 7, minOrderAmount: 40 },
    { code: "GAMEPASS12", type: CouponType.PERCENTAGE, value: 12, minOrderAmount: 30 },
    { code: "CREDIT10", type: CouponType.FIXED_AMOUNT, value: 10, minOrderAmount: 100 },
    { code: "STACKUP8", type: CouponType.PERCENTAGE, value: 8, minOrderAmount: 35 },
    { code: "DROP15", type: CouponType.PERCENTAGE, value: 15, minOrderAmount: 60 },
    { code: "FLASH5", type: CouponType.FIXED_AMOUNT, value: 5, minOrderAmount: 15 },
    { code: "LEVELUP", type: CouponType.PERCENTAGE, value: 10, minOrderAmount: 45 },
    { code: "NEXUSPLUS", type: CouponType.FIXED_AMOUNT, value: 12, minOrderAmount: 120 },
    { code: "WALLET15", type: CouponType.PERCENTAGE, value: 15, minOrderAmount: 35 },
    { code: "PLAYNOW", type: CouponType.FIXED_AMOUNT, value: 8, minOrderAmount: 55 },
    { code: "SUMMERDROP", type: CouponType.PERCENTAGE, value: 18, minOrderAmount: 90 }
  ];

  for (const coupon of coupons) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: {
        type: coupon.type,
        value: coupon.value,
        minOrderAmount: coupon.minOrderAmount,
        applicableTo: CouponScope.ALL
      },
      create: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minOrderAmount: coupon.minOrderAmount,
        applicableTo: CouponScope.ALL,
        productIds: [],
        categoryIds: [],
        platformIds: []
      }
    });
  }

  await prisma.announcement.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {
      title: "NEXUS Launch",
      message: "Full games, gift cards, subscriptions, and gaming credit delivered instantly from one verified store.",
      type: "INFO",
      isActive: true
    },
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      title: "NEXUS Launch",
      message: "Full games, gift cards, subscriptions, and gaming credit delivered instantly from one verified store.",
      type: "INFO",
      isActive: true,
      isDismissable: true
    }
  });

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {
      siteName: "NEXUS",
      siteUrl: "https://nexus.gg",
      supportEmail: "support@nexus.gg",
      allowGuestCheckout: true,
      defaultCurrency: "USD",
      defaultLanguage: "en",
      taxRate: 0,
      loyaltyPointsRate: 10,
      maxReviewLength: 1200
    },
    create: {
      id: 1,
      siteName: "NEXUS",
      siteUrl: "https://nexus.gg",
      supportEmail: "support@nexus.gg",
      allowGuestCheckout: true,
      defaultCurrency: "USD",
      defaultLanguage: "en",
      taxRate: 0,
      loyaltyPointsRate: 10,
      maxReviewLength: 1200
    }
  });

  for (const review of fakeReviews) {
    const user = await prisma.user.findUniqueOrThrow({
      where: { username: review.username }
    });
    const product = await prisma.product.findUniqueOrThrow({
      where: { slug: review.productSlug }
    });

    await prisma.review.upsert({
      where: {
        userId_productId: {
          userId: user.id,
          productId: product.id
        }
      },
      update: {
        rating: review.rating,
        title: review.title,
        body: review.body,
        isApproved: true,
        isVerifiedPurchase: true
      },
      create: {
        userId: user.id,
        productId: product.id,
        rating: review.rating,
        title: review.title,
        body: review.body,
        isApproved: true,
        isVerifiedPurchase: true
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
