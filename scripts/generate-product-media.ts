import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

type ProductSeedItem = {
  name: string;
  platformSlug: string;
  categorySlug: string;
  type: string;
  region: string;
  price: number;
  salePrice?: number;
  tags: string[];
  featured?: boolean;
  hot?: boolean;
  isNew?: boolean;
  stock: number;
  coverImageUrl?: string;
  thumbnailUrl?: string;
};

type FrontendProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  type: string;
  basePrice: number;
  salePrice: number | null;
  currency: string;
  stock: number;
  isFeatured: boolean;
  isHot: boolean;
  isNew: boolean;
  soldCount: number;
  coverImageUrl: string;
  thumbnailUrl: string;
  trailerVideoId?: string | null;
  images: string[];
  rating: number;
  reviewCount: number;
  tags: string[];
  region: string;
  platform: {
    id: string;
    name: string;
    slug: string;
    color: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
};

type MediaDescriptor = {
  key: string;
  title: string;
  subtitle: string;
  eyebrow: string;
  query: string;
  accent: string;
  secondary: string;
  surface: string;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const frontendSrcDir = path.join(rootDir, "frontend", "src");
const frontendPublicMediaDir = path.join(rootDir, "frontend", "public", "media", "product-covers");

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const platformMap = {
  steam: { id: "generated-steam", name: "Steam", slug: "steam", color: "#00D4FF" },
  "epic-games": { id: "generated-epic-games", name: "Epic Games", slug: "epic-games", color: "#E5E7EB" },
  xbox: { id: "generated-xbox", name: "Xbox", slug: "xbox", color: "#00FF88" },
  playstation: { id: "generated-playstation", name: "PlayStation", slug: "playstation", color: "#60A5FA" },
  nintendo: { id: "generated-nintendo", name: "Nintendo", slug: "nintendo", color: "#FF6B6B" },
  ea: { id: "generated-ea", name: "EA", slug: "ea", color: "#FB923C" },
  ubisoft: { id: "generated-ubisoft", name: "Ubisoft", slug: "ubisoft", color: "#93C5FD" },
  netflix: { id: "generated-netflix", name: "Netflix", slug: "netflix", color: "#E50914" },
  spotify: { id: "generated-spotify", name: "Spotify", slug: "spotify", color: "#1DB954" },
  discord: { id: "generated-discord", name: "Discord", slug: "discord", color: "#8B5CF6" }
} as const;

const categoryMap = {
  "pc-games": { id: "generated-pc-games", name: "PC Games", slug: "pc-games" },
  "gift-cards": { id: "generated-gift-cards", name: "Gift Cards", slug: "gift-cards" },
  subscriptions: { id: "generated-subscriptions", name: "Subscriptions", slug: "subscriptions" },
  "in-game-currency": { id: "generated-in-game-currency", name: "In-Game Currency", slug: "in-game-currency" }
} as const;

const formatTitle = (value: string) => {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > 16 && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines.slice(0, 3);
};

const detectCurrencyFamily = (name: string) => {
  if (/fortnite/i.test(name)) return "fortnite";
  if (/valorant/i.test(name)) return "valorant";
  if (/pubg/i.test(name)) return "pubg";
  if (/fifa|fc points|ea fc/i.test(name)) return "ea-fc";
  if (/call of duty/i.test(name)) return "call-of-duty";
  if (/roblox|robux/i.test(name)) return "roblox";
  if (/apex/i.test(name)) return "apex-legends";
  return "digital-currency";
};

const detectSubscriptionFamily = (name: string) => {
  if (/game pass/i.test(name)) return "xbox-game-pass";
  if (/playstation plus|ps plus/i.test(name)) return "playstation-plus";
  if (/ea play/i.test(name)) return "ea-play";
  if (/ubisoft/i.test(name)) return "ubisoft-plus";
  if (/discord/i.test(name)) return "discord-nitro";
  if (/netflix/i.test(name)) return "netflix";
  if (/spotify/i.test(name)) return "spotify-premium";
  return "premium-subscription";
};

const detectStoreCreditFamily = (item: ProductSeedItem) => {
  if (/steam/i.test(item.name) || item.platformSlug === "steam") return "steam-store";
  if (/playstation|psn/i.test(item.name) || item.platformSlug === "playstation") return "playstation-store";
  if (/xbox/i.test(item.name) || item.platformSlug === "xbox") return "xbox-store";
  if (/nintendo/i.test(item.name) || item.platformSlug === "nintendo") return "nintendo-eshop";
  return `${item.platformSlug}-store`;
};

const getMediaDescriptor = (item: ProductSeedItem): MediaDescriptor => {
  if (item.categorySlug === "pc-games") {
    return {
      key: `game-${slugify(item.name)}`,
      title: item.name,
      subtitle: "Full Game Digital Code",
      eyebrow: item.platformSlug.replace(/-/g, " ").toUpperCase(),
      query: `${item.name} official trailer`,
      accent: platformMap[item.platformSlug as keyof typeof platformMap]?.color ?? "#00D4FF",
      secondary: "#7C3AED",
      surface: "#09101F"
    };
  }

  if (item.categorySlug === "gift-cards" || item.type === "WALLET_TOP_UP") {
    const family = detectStoreCreditFamily(item);
    const title = family
      .replace(/-/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
      .replace("Store", "Store Credit");

    return {
      key: family,
      title,
      subtitle: item.type === "WALLET_TOP_UP" ? "Wallet Top-Up" : "Gift Card",
      eyebrow: "INSTANT BALANCE",
      query: `${title} official trailer`,
      accent: platformMap[item.platformSlug as keyof typeof platformMap]?.color ?? "#00D4FF",
      secondary: "#38BDF8",
      surface: "#101827"
    };
  }

  if (item.categorySlug === "subscriptions") {
    const family = detectSubscriptionFamily(item.name);
    const title = family
      .replace(/-/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
      .replace("Ea", "EA")
      .replace("Xbox Game Pass", "Xbox Game Pass")
      .replace("Playstation Plus", "PlayStation Plus")
      .replace("Spotify Premium", "Spotify Premium")
      .replace("Discord Nitro", "Discord Nitro")
      .replace("Ubisoft Plus", "Ubisoft+");

    return {
      key: family,
      title,
      subtitle: "Subscription Access",
      eyebrow: "PREMIUM MEMBERSHIP",
      query: `${title} official trailer`,
      accent: platformMap[item.platformSlug as keyof typeof platformMap]?.color ?? "#00D4FF",
      secondary: "#A855F7",
      surface: "#0F172A"
    };
  }

  const family = detectCurrencyFamily(item.name);
  const title = family
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .replace("Ea Fc", "EA FC")
    .replace("Pubg", "PUBG");

  return {
    key: family,
    title,
    subtitle: "In-Game Currency",
    eyebrow: "INSTANT TOP-UP",
    query: `${title} official trailer`,
    accent: platformMap[item.platformSlug as keyof typeof platformMap]?.color ?? "#00D4FF",
    secondary: "#22C55E",
    surface: "#08131C"
  };
};

const buildFrontendProduct = (item: ProductSeedItem, index: number): FrontendProduct => {
  const slug = slugify(item.name);
  const category = categoryMap[item.categorySlug as keyof typeof categoryMap];
  const platform = platformMap[item.platformSlug as keyof typeof platformMap];
  const description = `${item.name} from NEXUS with fast delivery, clear platform guidance, and verified digital stock.`;
  const shortDescription = `${item.name} delivered instantly as secure digital access from NEXUS.`;

  return {
    id: `generated-${slug}`,
    name: item.name,
    slug,
    description,
    shortDescription,
    type: item.type,
    basePrice: item.price,
    salePrice: item.salePrice ?? null,
    currency: "USD",
    stock: item.stock,
    isFeatured: item.featured ?? false,
    isHot: item.hot ?? false,
    isNew: item.isNew ?? false,
    soldCount: 60 + index * 7,
    coverImageUrl: item.coverImageUrl ?? item.thumbnailUrl ?? "",
    thumbnailUrl: item.thumbnailUrl ?? item.coverImageUrl ?? "",
    images: [item.coverImageUrl, item.thumbnailUrl].filter(Boolean) as string[],
    rating: Number((4 + (index % 10) * 0.1).toFixed(2)),
    reviewCount: 8 + (index % 18),
    tags: item.tags,
    region: item.region,
    platform,
    category
  };
};

const trailerThumbnail = (videoId: string) => `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

const posterSvg = (descriptor: MediaDescriptor) => {
  const titleLines = formatTitle(descriptor.title);
  const subtitle = descriptor.subtitle;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="900" height="1200" viewBox="0 0 900 1200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="92" y1="58" x2="848" y2="1122" gradientUnits="userSpaceOnUse">
      <stop stop-color="${descriptor.surface}" />
      <stop offset="0.58" stop-color="#0B1226" />
      <stop offset="1" stop-color="#04070F" />
    </linearGradient>
    <linearGradient id="line" x1="120" y1="100" x2="760" y2="1090" gradientUnits="userSpaceOnUse">
      <stop stop-color="${descriptor.accent}" stop-opacity="0.88" />
      <stop offset="1" stop-color="${descriptor.secondary}" stop-opacity="0.92" />
    </linearGradient>
    <radialGradient id="glowA" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(190 220) rotate(62) scale(420 320)">
      <stop stop-color="${descriptor.accent}" stop-opacity="0.34" />
      <stop offset="1" stop-color="${descriptor.accent}" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="glowB" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(700 960) rotate(88) scale(440 380)">
      <stop stop-color="${descriptor.secondary}" stop-opacity="0.28" />
      <stop offset="1" stop-color="${descriptor.secondary}" stop-opacity="0" />
    </radialGradient>
    <filter id="blurGlow" x="0" y="0" width="900" height="1200" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feGaussianBlur stdDeviation="34" />
    </filter>
  </defs>
  <rect width="900" height="1200" rx="56" fill="url(#bg)"/>
  <rect width="900" height="1200" rx="56" fill="url(#glowA)"/>
  <rect width="900" height="1200" rx="56" fill="url(#glowB)"/>
  <g opacity="0.18">
    <path d="M130 110H770" stroke="url(#line)" stroke-width="2"/>
    <path d="M130 1090H770" stroke="url(#line)" stroke-width="2"/>
    <path d="M110 170L790 1010" stroke="url(#line)" stroke-opacity="0.18"/>
    <path d="M780 170L160 1110" stroke="url(#line)" stroke-opacity="0.1"/>
  </g>
  <g opacity="0.35">
    <rect x="76" y="78" width="748" height="1044" rx="42" stroke="url(#line)" stroke-opacity="0.22"/>
    <rect x="112" y="116" width="676" height="968" rx="34" stroke="url(#line)" stroke-opacity="0.12"/>
  </g>
  <g filter="url(#blurGlow)" opacity="0.42">
    <ellipse cx="220" cy="250" rx="140" ry="90" fill="${descriptor.accent}"/>
    <ellipse cx="670" cy="900" rx="150" ry="100" fill="${descriptor.secondary}"/>
  </g>
  <rect x="116" y="132" rx="999" ry="999" width="266" height="42" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)"/>
  <text x="146" y="160" fill="#E5F7FF" font-size="19" font-weight="700" font-family="DM Sans, Arial, sans-serif" letter-spacing="4">${descriptor.eyebrow}</text>
  <g opacity="0.84">
    <path d="M92 846C182 720 294 658 424 624C574 586 672 506 750 336" stroke="url(#line)" stroke-width="10" stroke-linecap="round"/>
    <path d="M112 890C224 770 310 724 434 694C564 662 648 592 716 430" stroke="url(#line)" stroke-opacity="0.42" stroke-width="3" stroke-linecap="round"/>
  </g>
  <circle cx="708" cy="420" r="9" fill="#F8FAFC"/>
  <circle cx="726" cy="420" r="5" fill="${descriptor.accent}"/>
  ${titleLines
    .map(
      (line, index) =>
        `<text x="116" y="${410 + index * 104}" fill="#F8FBFF" font-size="84" font-weight="800" font-family="Orbitron, Arial, sans-serif">${line.replace(/&/g, "&amp;")}</text>`
    )
    .join("")}
  <text x="118" y="788" fill="#A9B8E6" font-size="28" font-weight="500" font-family="DM Sans, Arial, sans-serif" letter-spacing="2">${subtitle.replace(/&/g, "&amp;")}</text>
  <rect x="116" y="900" width="670" height="144" rx="30" fill="rgba(255,255,255,0.035)" stroke="rgba(255,255,255,0.08)"/>
  <text x="152" y="956" fill="${descriptor.accent}" font-size="20" font-weight="700" font-family="DM Sans, Arial, sans-serif" letter-spacing="5">NEXUS VERIFIED STOCK</text>
  <text x="152" y="1010" fill="#F8FAFC" font-size="34" font-weight="700" font-family="DM Sans, Arial, sans-serif">Instant digital delivery</text>
  <text x="152" y="1052" fill="#9FB3D9" font-size="24" font-weight="500" font-family="DM Sans, Arial, sans-serif">Premium storefront profile artwork</text>
</svg>`;
};

const fetchYoutubeVideoId = async (query: string) => {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  const html = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36"
    }
  }).then((response) => response.text());
  const matches = [...html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)].map((match) => match[1]);
  return matches.find(Boolean) ?? null;
};

const writeIfChanged = async (targetPath: string, content: string) => {
  try {
    const current = await fs.readFile(targetPath, "utf8");
    if (current === content) {
      return;
    }
  } catch {
    // ignore
  }

  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, content, "utf8");
};

const catalogModulePath = pathToFileURL(path.join(rootDir, "backend", "prisma", "catalog.data.ts")).href;
const catalogModule = await import(catalogModulePath);
const productCatalog = (catalogModule.default.productCatalog ?? catalogModule.productCatalog) as ProductSeedItem[];

const frontendCatalog = productCatalog.map(buildFrontendProduct);
const descriptors = new Map<string, MediaDescriptor>();

for (const item of productCatalog) {
  const descriptor = getMediaDescriptor(item);
  if (!descriptors.has(descriptor.key)) {
    descriptors.set(descriptor.key, descriptor);
  }
}

const trailerMap: Record<string, string> = {};

for (const [index, descriptor] of [...descriptors.values()].entries()) {
  process.stdout.write(`Resolving trailer ${index + 1}/${descriptors.size}: ${descriptor.query}\n`);
  try {
    const videoId = await fetchYoutubeVideoId(descriptor.query);
    if (videoId) {
      trailerMap[descriptor.key] = videoId;
    }
  } catch (error) {
    process.stdout.write(`Failed to resolve trailer for ${descriptor.key}: ${String(error)}\n`);
  }
}

for (const descriptor of descriptors.values()) {
  const assetPath = path.join(frontendPublicMediaDir, `${descriptor.key}.svg`);
  await writeIfChanged(assetPath, posterSvg(descriptor));
}

const generatedCatalogContent = `import type { Product } from "../types/product.types";

export const generatedCatalogProducts: Product[] = ${JSON.stringify(frontendCatalog, null, 2)} as Product[];
`;

const generatedMediaContent = `export const generatedTrailerVideoIds: Record<string, string> = ${JSON.stringify(
  trailerMap,
  null,
  2
)};

export const generatedTrailerQueries: Record<string, string> = ${JSON.stringify(
  Object.fromEntries([...descriptors.entries()].map(([key, value]) => [key, value.query])),
  null,
  2
)};

export const generatedTrailerThumbnails: Record<string, string> = ${JSON.stringify(
  Object.fromEntries(Object.entries(trailerMap).map(([key, value]) => [key, trailerThumbnail(value)])),
  null,
  2
)};
`;

await writeIfChanged(path.join(frontendSrcDir, "data", "generatedCatalog.ts"), generatedCatalogContent);
await writeIfChanged(path.join(frontendSrcDir, "data", "generatedProductMedia.ts"), generatedMediaContent);

process.stdout.write(
  `Generated ${frontendCatalog.length} fallback products, ${Object.keys(trailerMap).length} trailer mappings, and ${descriptors.size} artwork files.\n`
);
