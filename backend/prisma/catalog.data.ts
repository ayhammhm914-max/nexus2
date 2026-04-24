import { ProductRegion, ProductType } from "@prisma/client";

export type CatalogSeedItem = {
  name: string;
  platformSlug: string;
  categorySlug: string;
  type: ProductType;
  region: ProductRegion;
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

type GameDefinition = {
  name: string;
  platformSlug: string;
  price: number;
  salePrice?: number;
  tags: string[];
  appId?: number;
  featured?: boolean;
  hot?: boolean;
  isNew?: boolean;
  stock?: number;
};

const encodeTitle = (title: string) => encodeURIComponent(title.replace(/\s+/g, " ").trim());

const placeholderCover = (title: string, background: string, foreground = "F8FAFC") =>
  `https://placehold.co/900x1200/${background}/${foreground}?text=${encodeTitle(title)}`;

const placeholderThumb = (title: string, background: string, foreground = "F8FAFC") =>
  `https://placehold.co/900x520/${background}/${foreground}?text=${encodeTitle(title)}`;

const steamCover = (appId: number) =>
  `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appId}/library_600x900_2x.jpg`;

const steamThumb = (appId: number) =>
  `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appId}/capsule_616x353.jpg`;

const platformPalette: Record<string, { background: string; foreground?: string }> = {
  steam: { background: "111827", foreground: "00D4FF" },
  "epic-games": { background: "0F172A", foreground: "E5E7EB" },
  xbox: { background: "052E16", foreground: "4ADE80" },
  playstation: { background: "0A1B4D", foreground: "60A5FA" },
  nintendo: { background: "450A0A", foreground: "FCA5A5" },
  ea: { background: "431407", foreground: "FB923C" },
  ubisoft: { background: "172554", foreground: "93C5FD" },
  netflix: { background: "5F0A17", foreground: "E50914" },
  spotify: { background: "0B3A21", foreground: "1DB954" },
  discord: { background: "1F1B45", foreground: "8B5CF6" }
};

const buildMedia = (title: string, platformSlug: string, appId?: number) => {
  if (appId) {
    return {
      coverImageUrl: steamCover(appId),
      thumbnailUrl: steamThumb(appId)
    };
  }

  const palette = platformPalette[platformSlug] ?? platformPalette.steam;
  return {
    coverImageUrl: placeholderCover(title, palette.background, palette.foreground),
    thumbnailUrl: placeholderThumb(title, palette.background, palette.foreground)
  };
};

type SubscriptionTheme = {
  match: RegExp;
  asset: string;
};

const subscriptionThemes: SubscriptionTheme[] = [
  {
    match: /netflix/i,
    asset: "netflix"
  },
  {
    match: /playstation|sony|psn/i,
    asset: "playstation-plus"
  },
  {
    match: /xbox/i,
    asset: "xbox-game-pass"
  },
  {
    match: /ea play|ea\s|^ea$/i,
    asset: "ea-play"
  },
  {
    match: /ubisoft/i,
    asset: "ubisoft-plus"
  },
  {
    match: /discord/i,
    asset: "discord-nitro"
  },
  {
    match: /spotify/i,
    asset: "spotify-premium"
  }
];

const buildSubscriptionArtwork = (title: string) => {
  const theme = subscriptionThemes.find((entry) => entry.match.test(title));
  const asset = theme?.asset ?? "generic";
  const path = `/media/subscriptions/${asset}.svg`;

  return {
    coverImageUrl: path,
    thumbnailUrl: path
  };
};

const game = (definition: GameDefinition): CatalogSeedItem => {
  const media = buildMedia(definition.name, definition.platformSlug, definition.appId);

  return {
    name: definition.name,
    platformSlug: definition.platformSlug,
    categorySlug: "pc-games",
    type: ProductType.GAME_KEY,
    region: ProductRegion.GLOBAL,
    price: definition.price,
    salePrice: definition.salePrice,
    tags: [...definition.tags, "full-game", "digital-code"],
    featured: definition.featured,
    hot: definition.hot,
    isNew: definition.isNew,
    stock: definition.stock ?? 8,
    ...media
  };
};

const walletProduct = (
  name: string,
  platformSlug: string,
  regionLabel: string,
  region: ProductRegion,
  amount: number
): CatalogSeedItem => {
  const title = `${name} $${amount} ${regionLabel}`;
  return {
    name: title,
    platformSlug,
    categorySlug: "gift-cards",
    type: ProductType.WALLET_TOP_UP,
    region,
    price: amount,
    tags: ["wallet", "top-up", regionLabel.toLowerCase()],
    stock: 18,
    ...buildMedia(title, platformSlug)
  };
};

const giftCardProduct = (
  brand: string,
  platformSlug: string,
  regionLabel: string,
  region: ProductRegion,
  amount: number
): CatalogSeedItem => {
  const title = `${brand} $${amount} ${regionLabel}`;
  return {
    name: title,
    platformSlug,
    categorySlug: "gift-cards",
    type: ProductType.GIFT_CARD,
    region,
    price: amount,
    tags: ["gift-card", brand.toLowerCase(), regionLabel.toLowerCase()],
    stock: 16,
    ...buildMedia(title, platformSlug)
  };
};

const subscriptionProduct = (
  title: string,
  platformSlug: string,
  regionLabel: string,
  region: ProductRegion,
  price: number,
  salePrice?: number
): CatalogSeedItem => {
  const productTitle = `${title} ${regionLabel}`;
  const media = buildSubscriptionArtwork(productTitle);

  return {
    name: productTitle,
    platformSlug,
    categorySlug: "subscriptions",
    type: ProductType.SUBSCRIPTION,
    region,
    price,
    salePrice,
    tags: ["subscription", regionLabel.toLowerCase(), title.toLowerCase()],
    stock: 14,
    ...media
  };
};

const currencyProduct = (
  title: string,
  platformSlug: string,
  amountLabel: string,
  price: number,
  salePrice?: number
): CatalogSeedItem => ({
  name: `${title} ${amountLabel}`,
  platformSlug,
  categorySlug: "in-game-currency",
  type: ProductType.IN_GAME_CURRENCY,
  region: ProductRegion.GLOBAL,
  price,
  salePrice,
  tags: ["currency", title.toLowerCase().replace(/\s+/g, "-"), amountLabel.toLowerCase()],
  stock: 20,
  ...buildMedia(`${title} ${amountLabel}`, platformSlug)
});

const pcGames: CatalogSeedItem[] = [
  game({ name: "Cyberpunk 2077", platformSlug: "steam", price: 59.99, salePrice: 42.99, tags: ["rpg", "open-world", "sci-fi"], appId: 1091500, featured: true, hot: true, stock: 10 }),
  game({ name: "Elden Ring", platformSlug: "steam", price: 59.99, salePrice: 47.99, tags: ["soulslike", "fantasy", "action-rpg"], appId: 1245620, featured: true, stock: 10 }),
  game({ name: "Red Dead Redemption 2", platformSlug: "steam", price: 59.99, salePrice: 24.99, tags: ["western", "open-world", "story"], appId: 1174180, featured: true, stock: 9 }),
  game({ name: "GTA V", platformSlug: "steam", price: 29.99, salePrice: 14.99, tags: ["crime", "open-world", "online"], appId: 271590, hot: true, stock: 12 }),
  game({ name: "Call of Duty Modern Warfare III", platformSlug: "steam", price: 69.99, salePrice: 54.99, tags: ["fps", "military", "multiplayer"], stock: 8 }),
  game({ name: "Call of Duty Warzone Packs", platformSlug: "steam", price: 19.99, salePrice: 14.99, tags: ["fps", "bundle", "dlc"], stock: 10 }),
  game({ name: "Assassin's Creed Mirage", platformSlug: "ubisoft", price: 49.99, salePrice: 31.99, tags: ["stealth", "adventure", "open-world"], stock: 10 }),
  game({ name: "Assassin's Creed Valhalla", platformSlug: "ubisoft", price: 59.99, salePrice: 21.99, tags: ["viking", "open-world", "action-rpg"], stock: 9 }),
  game({ name: "Assassin's Creed Odyssey", platformSlug: "ubisoft", price: 39.99, salePrice: 13.99, tags: ["greece", "open-world", "action-rpg"], appId: 812140, stock: 10 }),
  game({ name: "Assassin's Creed Origins", platformSlug: "ubisoft", price: 39.99, salePrice: 12.99, tags: ["egypt", "open-world", "action"], appId: 582160, stock: 10 }),
  game({ name: "FIFA 23", platformSlug: "ea", price: 39.99, salePrice: 19.99, tags: ["football", "sports", "ultimate-team"], stock: 9 }),
  game({ name: "EA Sports FC 24", platformSlug: "ea", price: 59.99, salePrice: 27.99, tags: ["football", "sports", "ultimate-team"], stock: 10 }),
  game({ name: "Battlefield 2042", platformSlug: "ea", price: 59.99, salePrice: 16.99, tags: ["fps", "multiplayer", "war"], appId: 1517290, stock: 11 }),
  game({ name: "Battlefield V", platformSlug: "ea", price: 49.99, salePrice: 9.99, tags: ["fps", "war", "teamplay"], appId: 1238810, stock: 10 }),
  game({ name: "The Witcher 3", platformSlug: "steam", price: 39.99, salePrice: 8.99, tags: ["rpg", "fantasy", "story"], appId: 292030, featured: true, stock: 10 }),
  game({ name: "Hogwarts Legacy", platformSlug: "steam", price: 59.99, salePrice: 34.99, tags: ["magic", "open-world", "rpg"], appId: 990080, featured: true, stock: 10 }),
  game({ name: "Starfield", platformSlug: "xbox", price: 69.99, salePrice: 46.99, tags: ["space", "rpg", "open-world"], appId: 1716740, stock: 9 }),
  game({ name: "Resident Evil 4 Remake", platformSlug: "steam", price: 59.99, salePrice: 33.99, tags: ["horror", "survival", "action"], appId: 2050650, stock: 9 }),
  game({ name: "Resident Evil Village", platformSlug: "steam", price: 39.99, salePrice: 18.99, tags: ["horror", "survival", "story"], appId: 1196590, stock: 9 }),
  game({ name: "Resident Evil 2 Remake", platformSlug: "steam", price: 39.99, salePrice: 14.99, tags: ["horror", "survival", "zombies"], appId: 883710, stock: 9 }),
  game({ name: "Resident Evil 3 Remake", platformSlug: "steam", price: 39.99, salePrice: 12.99, tags: ["horror", "survival", "action"], appId: 952060, stock: 8 }),
  game({ name: "Forza Horizon 5", platformSlug: "xbox", price: 59.99, salePrice: 38.99, tags: ["racing", "open-world", "cars"], appId: 1551360, featured: true, stock: 11 }),
  game({ name: "Forza Horizon 4", platformSlug: "xbox", price: 49.99, salePrice: 19.99, tags: ["racing", "cars", "open-world"], appId: 1293830, stock: 10 }),
  game({ name: "Microsoft Flight Simulator", platformSlug: "xbox", price: 59.99, salePrice: 41.99, tags: ["simulation", "aviation", "open-world"], appId: 1250410, stock: 8 }),
  game({ name: "Sea of Thieves", platformSlug: "xbox", price: 39.99, salePrice: 21.99, tags: ["pirates", "co-op", "adventure"], appId: 1172620, stock: 10 }),
  game({ name: "Rust", platformSlug: "steam", price: 39.99, salePrice: 29.99, tags: ["survival", "multiplayer", "crafting"], appId: 252490, stock: 11 }),
  game({ name: "DayZ", platformSlug: "steam", price: 44.99, salePrice: 27.99, tags: ["survival", "zombies", "open-world"], appId: 221100, stock: 10 }),
  game({ name: "ARK Survival Evolved", platformSlug: "steam", price: 29.99, salePrice: 12.99, tags: ["dinosaurs", "survival", "crafting"], appId: 346110, stock: 10 }),
  game({ name: "ARK Survival Ascended", platformSlug: "steam", price: 44.99, salePrice: 36.99, tags: ["dinosaurs", "survival", "unreal-5"], appId: 2399830, isNew: true, stock: 8 }),
  game({ name: "Valheim", platformSlug: "steam", price: 19.99, salePrice: 14.99, tags: ["survival", "viking", "co-op"], appId: 892970, stock: 11 }),
  game({ name: "Terraria", platformSlug: "steam", price: 9.99, salePrice: 6.99, tags: ["sandbox", "crafting", "indie"], appId: 105600, stock: 14 }),
  game({ name: "Stardew Valley", platformSlug: "steam", price: 14.99, salePrice: 9.99, tags: ["farming", "indie", "cozy"], appId: 413150, stock: 14 }),
  game({ name: "Hollow Knight", platformSlug: "steam", price: 14.99, salePrice: 8.99, tags: ["metroidvania", "indie", "platformer"], appId: 367520, stock: 12 }),
  game({ name: "Hades", platformSlug: "steam", price: 24.99, salePrice: 15.99, tags: ["roguelike", "action", "indie"], appId: 1145360, stock: 12 }),
  game({ name: "Dead Cells", platformSlug: "steam", price: 24.99, salePrice: 13.99, tags: ["roguelike", "metroidvania", "action"], appId: 588650, stock: 11 }),
  game({ name: "Cuphead", platformSlug: "steam", price: 19.99, salePrice: 14.99, tags: ["platformer", "boss-rush", "co-op"], appId: 268910, stock: 11 }),
  game({ name: "Ori and the Blind Forest", platformSlug: "steam", price: 19.99, salePrice: 9.99, tags: ["platformer", "story", "beautiful"], appId: 387290, stock: 10 }),
  game({ name: "Ori and the Will of the Wisps", platformSlug: "steam", price: 29.99, salePrice: 11.99, tags: ["platformer", "story", "beautiful"], appId: 1057090, stock: 10 }),
  game({ name: "Dying Light", platformSlug: "steam", price: 29.99, salePrice: 9.99, tags: ["zombies", "parkour", "survival"], appId: 239140, stock: 10 }),
  game({ name: "Dying Light 2", platformSlug: "steam", price: 59.99, salePrice: 24.99, tags: ["zombies", "parkour", "open-world"], appId: 534380, stock: 9 }),
  game({ name: "The Forest", platformSlug: "steam", price: 19.99, salePrice: 10.99, tags: ["survival", "horror", "co-op"], appId: 242760, stock: 11 }),
  game({ name: "Sons of the Forest", platformSlug: "steam", price: 29.99, salePrice: 25.99, tags: ["survival", "horror", "co-op"], appId: 1326470, stock: 9 }),
  game({ name: "Metro Exodus", platformSlug: "steam", price: 29.99, salePrice: 8.99, tags: ["fps", "story", "post-apocalypse"], appId: 412020, stock: 10 }),
  game({ name: "Metro Last Light", platformSlug: "steam", price: 19.99, salePrice: 5.99, tags: ["fps", "story", "post-apocalypse"], appId: 287390, stock: 10 }),
  game({ name: "Metro 2033", platformSlug: "steam", price: 19.99, salePrice: 4.99, tags: ["fps", "story", "post-apocalypse"], appId: 286690, stock: 10 }),
  game({ name: "Watch Dogs Legion", platformSlug: "ubisoft", price: 59.99, salePrice: 17.99, tags: ["hacking", "open-world", "action"], stock: 9 }),
  game({ name: "Watch Dogs 2", platformSlug: "ubisoft", price: 49.99, salePrice: 9.99, tags: ["hacking", "open-world", "action"], appId: 447040, stock: 10 }),
  game({ name: "Watch Dogs", platformSlug: "ubisoft", price: 29.99, salePrice: 7.99, tags: ["hacking", "open-world", "action"], appId: 243470, stock: 10 }),
  game({ name: "Far Cry 6", platformSlug: "ubisoft", price: 59.99, salePrice: 16.99, tags: ["shooter", "open-world", "action"], stock: 9 }),
  game({ name: "Far Cry 5", platformSlug: "ubisoft", price: 39.99, salePrice: 8.99, tags: ["shooter", "open-world", "co-op"], appId: 552520, stock: 10 }),
  game({ name: "Far Cry 4", platformSlug: "ubisoft", price: 29.99, salePrice: 6.99, tags: ["shooter", "open-world", "action"], appId: 298110, stock: 10 }),
  game({ name: "Far Cry 3", platformSlug: "ubisoft", price: 19.99, salePrice: 4.99, tags: ["shooter", "island", "action"], appId: 220240, stock: 11 }),
  game({ name: "Rainbow Six Siege", platformSlug: "ubisoft", price: 19.99, salePrice: 7.99, tags: ["fps", "competitive", "tactical"], appId: 359550, hot: true, stock: 12 }),
  game({ name: "Rainbow Six Extraction", platformSlug: "ubisoft", price: 39.99, salePrice: 11.99, tags: ["fps", "co-op", "tactical"], stock: 9 }),
  game({ name: "Payday 2", platformSlug: "steam", price: 9.99, salePrice: 3.99, tags: ["heist", "co-op", "fps"], appId: 218620, stock: 13 }),
  game({ name: "Payday 3", platformSlug: "steam", price: 39.99, salePrice: 18.99, tags: ["heist", "co-op", "fps"], appId: 1272080, stock: 9 }),
  game({ name: "The Division 2", platformSlug: "ubisoft", price: 29.99, salePrice: 11.99, tags: ["looter-shooter", "co-op", "rpg"], stock: 10 }),
  game({ name: "The Division", platformSlug: "ubisoft", price: 19.99, salePrice: 6.99, tags: ["looter-shooter", "co-op", "rpg"], appId: 365590, stock: 10 }),
  game({ name: "Borderlands 3", platformSlug: "steam", price: 59.99, salePrice: 14.99, tags: ["looter-shooter", "co-op", "fps"], appId: 397540, stock: 10 }),
  game({ name: "Borderlands 2", platformSlug: "steam", price: 19.99, salePrice: 5.99, tags: ["looter-shooter", "co-op", "fps"], appId: 49520, stock: 12 }),
  game({ name: "Borderlands GOTY", platformSlug: "steam", price: 29.99, salePrice: 8.99, tags: ["looter-shooter", "fps", "classic"], appId: 729040, stock: 10 }),
  game({ name: "Bioshock Infinite", platformSlug: "steam", price: 29.99, salePrice: 6.99, tags: ["fps", "story", "sci-fi"], appId: 8870, stock: 11 }),
  game({ name: "Bioshock 2", platformSlug: "steam", price: 19.99, salePrice: 5.99, tags: ["fps", "story", "underwater"], appId: 409720, stock: 10 }),
  game({ name: "Bioshock Remastered", platformSlug: "steam", price: 19.99, salePrice: 5.99, tags: ["fps", "story", "underwater"], appId: 409710, stock: 10 }),
  game({ name: "Civilization VI", platformSlug: "steam", price: 59.99, salePrice: 11.99, tags: ["strategy", "turn-based", "empire"], appId: 289070, stock: 10 }),
  game({ name: "Civilization V", platformSlug: "steam", price: 29.99, salePrice: 7.99, tags: ["strategy", "turn-based", "empire"], appId: 8930, stock: 10 }),
  game({ name: "Age of Empires IV", platformSlug: "xbox", price: 39.99, salePrice: 24.99, tags: ["strategy", "rts", "history"], appId: 1466860, stock: 10 }),
  game({ name: "Age of Empires II", platformSlug: "xbox", price: 19.99, salePrice: 9.99, tags: ["strategy", "rts", "classic"], appId: 813780, stock: 11 }),
  game({ name: "Total War Warhammer III", platformSlug: "steam", price: 59.99, salePrice: 39.99, tags: ["strategy", "warhammer", "grand-strategy"], appId: 1142710, stock: 9 }),
  game({ name: "Total War Rome II", platformSlug: "steam", price: 39.99, salePrice: 12.99, tags: ["strategy", "history", "grand-strategy"], appId: 214950, stock: 10 }),
  game({ name: "Total War Three Kingdoms", platformSlug: "steam", price: 59.99, salePrice: 19.99, tags: ["strategy", "history", "china"], appId: 779340, stock: 9 }),
  game({ name: "Cities Skylines", platformSlug: "steam", price: 29.99, salePrice: 7.99, tags: ["city-builder", "simulation", "strategy"], appId: 255710, stock: 11 }),
  game({ name: "SimCity", platformSlug: "ea", price: 19.99, salePrice: 9.99, tags: ["city-builder", "simulation", "classic"], stock: 10 }),
  game({ name: "Planet Zoo", platformSlug: "steam", price: 44.99, salePrice: 16.99, tags: ["simulation", "management", "animals"], appId: 703080, stock: 10 }),
  game({ name: "Planet Coaster", platformSlug: "steam", price: 44.99, salePrice: 12.99, tags: ["simulation", "management", "theme-park"], appId: 493340, stock: 10 }),
  game({ name: "Football Manager 2024", platformSlug: "steam", price: 59.99, salePrice: 39.99, tags: ["sports", "management", "football"], stock: 9 }),
  game({ name: "Football Manager 2023", platformSlug: "steam", price: 49.99, salePrice: 21.99, tags: ["sports", "management", "football"], stock: 9 }),
  game({ name: "Euro Truck Simulator 2", platformSlug: "steam", price: 19.99, salePrice: 7.99, tags: ["driving", "simulation", "trucking"], appId: 227300, stock: 12 }),
  game({ name: "American Truck Simulator", platformSlug: "steam", price: 19.99, salePrice: 7.99, tags: ["driving", "simulation", "trucking"], appId: 270880, stock: 11 }),
  game({ name: "BeamNG.drive", platformSlug: "steam", price: 24.99, salePrice: 19.99, tags: ["driving", "simulation", "physics"], appId: 284160, stock: 11 }),
  game({ name: "Garry's Mod", platformSlug: "steam", price: 9.99, salePrice: 6.99, tags: ["sandbox", "physics", "modding"], appId: 4000, stock: 12 }),
  game({ name: "Phasmophobia", platformSlug: "steam", price: 13.99, salePrice: 10.99, tags: ["horror", "co-op", "ghosts"], appId: 739630, hot: true, stock: 12 }),
  game({ name: "Lethal Company", platformSlug: "steam", price: 9.99, salePrice: 7.99, tags: ["co-op", "horror", "indie"], appId: 1966720, hot: true, stock: 12 }),
  game({ name: "Among Us", platformSlug: "steam", price: 4.99, salePrice: 3.99, tags: ["party", "social-deduction", "multiplayer"], appId: 945360, stock: 15 }),
  game({ name: "Fall Guys", platformSlug: "epic-games", price: 9.99, salePrice: 6.99, tags: ["party", "multiplayer", "platformer"], stock: 13 }),
  game({ name: "Human Fall Flat", platformSlug: "steam", price: 19.99, salePrice: 8.99, tags: ["party", "physics", "co-op"], appId: 477160, stock: 12 }),
  game({ name: "Gang Beasts", platformSlug: "steam", price: 19.99, salePrice: 12.99, tags: ["party", "physics", "brawler"], appId: 285900, stock: 12 }),
  game({ name: "Overcooked 2", platformSlug: "steam", price: 24.99, salePrice: 8.99, tags: ["co-op", "party", "cooking"], appId: 728880, stock: 12 }),
  game({ name: "Overcooked All You Can Eat", platformSlug: "steam", price: 39.99, salePrice: 14.99, tags: ["co-op", "party", "bundle"], stock: 10 }),
  game({ name: "Project Zomboid", platformSlug: "steam", price: 19.99, salePrice: 14.99, tags: ["survival", "zombies", "sandbox"], appId: 108600, stock: 11 }),
  game({ name: "Escape Simulator", platformSlug: "steam", price: 14.99, salePrice: 10.99, tags: ["puzzle", "co-op", "escape-room"], appId: 1435790, stock: 11 }),
  game({ name: "Teardown", platformSlug: "steam", price: 29.99, salePrice: 21.99, tags: ["sandbox", "physics", "destruction"], appId: 1167630, stock: 10 }),
  game({ name: "Satisfactory", platformSlug: "steam", price: 29.99, salePrice: 24.99, tags: ["factory", "automation", "sandbox"], appId: 526870, stock: 11 }),
  game({ name: "Factorio", platformSlug: "steam", price: 34.99, tags: ["factory", "automation", "strategy"], appId: 427520, stock: 10 }),
  game({ name: "Dyson Sphere Program", platformSlug: "steam", price: 19.99, salePrice: 15.99, tags: ["factory", "space", "automation"], appId: 1366540, stock: 10 }),
  game({ name: "Subnautica", platformSlug: "steam", price: 29.99, salePrice: 12.99, tags: ["survival", "underwater", "exploration"], appId: 264710, stock: 11 }),
  game({ name: "Subnautica Below Zero", platformSlug: "steam", price: 29.99, salePrice: 16.99, tags: ["survival", "underwater", "exploration"], appId: 848450, stock: 10 }),
  game({ name: "Raft", platformSlug: "steam", price: 19.99, salePrice: 16.99, tags: ["survival", "co-op", "ocean"], appId: 648800, stock: 10 }),
  game({ name: "Stray", platformSlug: "steam", price: 29.99, salePrice: 18.99, tags: ["adventure", "story", "indie"], appId: 1332010, stock: 10 }),
  game({ name: "Little Nightmares", platformSlug: "steam", price: 19.99, salePrice: 6.99, tags: ["horror", "puzzle", "platformer"], appId: 424840, stock: 11 }),
  game({ name: "Little Nightmares II", platformSlug: "steam", price: 29.99, salePrice: 11.99, tags: ["horror", "puzzle", "platformer"], appId: 860510, stock: 10 })
];

const psnRegions = [
  { label: "USA", region: ProductRegion.US },
  { label: "UK", region: ProductRegion.UK },
  { label: "UAE", region: ProductRegion.MENA },
  { label: "Saudi", region: ProductRegion.MENA },
  { label: "Turkey", region: ProductRegion.TR },
  { label: "Europe", region: ProductRegion.EU },
  { label: "Global", region: ProductRegion.GLOBAL }
];

const xboxRegions = [
  { label: "US", region: ProductRegion.US },
  { label: "UK", region: ProductRegion.UK },
  { label: "EU", region: ProductRegion.EU },
  { label: "Turkey", region: ProductRegion.TR },
  { label: "Brazil", region: ProductRegion.BR }
];

const nintendoRegions = [
  { label: "USA", region: ProductRegion.US },
  { label: "Europe", region: ProductRegion.EU },
  { label: "Japan", region: ProductRegion.APAC }
];

const walletRegions = [
  { label: "Global", region: ProductRegion.GLOBAL },
  { label: "USA", region: ProductRegion.US },
  { label: "UK", region: ProductRegion.UK },
  { label: "Europe", region: ProductRegion.EU },
  { label: "Turkey", region: ProductRegion.TR },
  { label: "Brazil", region: ProductRegion.BR },
  { label: "Argentina", region: ProductRegion.AR },
  { label: "UAE", region: ProductRegion.MENA },
  { label: "Saudi", region: ProductRegion.MENA },
  { label: "Asia", region: ProductRegion.APAC }
];

const subscriptionRegions = [
  { label: "Global", region: ProductRegion.GLOBAL },
  { label: "USA", region: ProductRegion.US },
  { label: "UK", region: ProductRegion.UK },
  { label: "Europe", region: ProductRegion.EU },
  { label: "Turkey", region: ProductRegion.TR },
  { label: "Brazil", region: ProductRegion.BR },
  { label: "Argentina", region: ProductRegion.AR },
  { label: "UAE", region: ProductRegion.MENA },
  { label: "Saudi", region: ProductRegion.MENA },
  { label: "Asia", region: ProductRegion.APAC }
];

const psnCards = [5, 10, 20, 25, 30, 50, 60, 75, 100].flatMap((amount) =>
  psnRegions.map(({ label, region }) =>
    giftCardProduct("PlayStation Store Card", "playstation", label, region, amount)
  )
);

const xboxCards = [5, 10, 15, 20, 25, 30, 50, 75, 100].flatMap((amount) =>
  xboxRegions.map(({ label, region }) => giftCardProduct("Xbox Gift Card", "xbox", label, region, amount))
);

const nintendoCards = [5, 10, 20, 35, 50, 70, 100].flatMap((amount) =>
  nintendoRegions.map(({ label, region }) =>
    giftCardProduct("Nintendo eShop Card", "nintendo", label, region, amount)
  )
);

const walletTopUps = [
  ...[5, 10, 20, 50, 100].flatMap((amount) =>
    walletRegions.map(({ label, region }) =>
      walletProduct("Steam Wallet", "steam", label, region, amount)
    )
  ),
  ...[10, 20, 50, 100].flatMap((amount) =>
    walletRegions.map(({ label, region }) =>
      walletProduct("PlayStation Wallet", "playstation", label, region, amount)
    )
  ),
  ...[10, 20, 50, 100].flatMap((amount) =>
    walletRegions.map(({ label, region }) => walletProduct("Xbox Wallet", "xbox", label, region, amount))
  ),
  ...[10, 20, 50, 100].flatMap((amount) =>
    walletRegions.map(({ label, region }) =>
      walletProduct("Nintendo Wallet", "nintendo", label, region, amount)
    )
  )
];

const subscriptions = [
  { title: "Xbox Game Pass Core", platformSlug: "xbox", price: 9.99, salePrice: 7.99 },
  { title: "Xbox Game Pass Ultimate 1 Month", platformSlug: "xbox", price: 16.99, salePrice: 13.99 },
  { title: "Xbox Game Pass Ultimate 3 Months", platformSlug: "xbox", price: 44.99, salePrice: 36.99 },
  { title: "Xbox Game Pass Ultimate 6 Months", platformSlug: "xbox", price: 79.99, salePrice: 68.99 },
  { title: "Xbox Game Pass Ultimate 12 Months", platformSlug: "xbox", price: 149.99, salePrice: 128.99 },
  { title: "EA Play 1 Month", platformSlug: "ea", price: 5.99, salePrice: 4.99 },
  { title: "EA Play 12 Months", platformSlug: "ea", price: 29.99, salePrice: 23.99 },
  { title: "PlayStation Plus Essential", platformSlug: "playstation", price: 9.99, salePrice: 8.49 },
  { title: "PlayStation Plus Extra", platformSlug: "playstation", price: 14.99, salePrice: 12.99 },
  { title: "PlayStation Plus Premium", platformSlug: "playstation", price: 17.99, salePrice: 15.49 },
  { title: "Ubisoft+", platformSlug: "ubisoft", price: 17.99, salePrice: 14.99 },
  { title: "Discord Nitro", platformSlug: "discord", price: 9.99, salePrice: 8.49 },
  { title: "Netflix Gift", platformSlug: "netflix", price: 25.99, salePrice: 22.99 },
  { title: "Spotify Premium", platformSlug: "spotify", price: 10.99, salePrice: 8.99 }
].flatMap((item) =>
  subscriptionRegions.map(({ label, region }) =>
    subscriptionProduct(item.title, item.platformSlug, label, region, item.price, item.salePrice)
  )
);

const inGameCurrency = [
  currencyProduct("Fortnite V-Bucks", "epic-games", "1000", 8.99),
  currencyProduct("Fortnite V-Bucks", "epic-games", "2800", 22.99, 19.99),
  currencyProduct("Fortnite V-Bucks", "epic-games", "5000", 36.99, 33.99),
  currencyProduct("Fortnite V-Bucks", "epic-games", "13500", 89.99, 82.99),
  currencyProduct("Valorant VP", "epic-games", "475", 4.99),
  currencyProduct("Valorant VP", "epic-games", "1000", 9.99),
  currencyProduct("Valorant VP", "epic-games", "2050", 19.99),
  currencyProduct("Valorant VP", "epic-games", "3650", 34.99),
  currencyProduct("Valorant VP", "epic-games", "5350", 49.99, 45.99),
  currencyProduct("PUBG UC", "xbox", "60", 0.99),
  currencyProduct("PUBG UC", "xbox", "300", 4.99),
  currencyProduct("PUBG UC", "xbox", "600", 9.49),
  currencyProduct("PUBG UC", "xbox", "1500", 22.99),
  currencyProduct("PUBG UC", "xbox", "3000", 44.99),
  currencyProduct("FC Points", "ea", "100", 0.99),
  currencyProduct("FC Points", "ea", "500", 4.99),
  currencyProduct("FC Points", "ea", "1050", 9.99),
  currencyProduct("FC Points", "ea", "2200", 19.99, 17.99),
  currencyProduct("FC Points", "ea", "4600", 39.99, 35.99),
  currencyProduct("Call of Duty Points", "xbox", "500 CP", 4.99),
  currencyProduct("Call of Duty Points", "xbox", "1100 CP", 9.99),
  currencyProduct("Call of Duty Points", "xbox", "2400 CP", 19.99),
  currencyProduct("Call of Duty Points", "xbox", "5000 CP", 39.99, 35.99),
  currencyProduct("Roblox Robux", "xbox", "400", 4.99),
  currencyProduct("Roblox Robux", "xbox", "800", 9.99),
  currencyProduct("Roblox Robux", "xbox", "1700", 19.99),
  currencyProduct("Roblox Robux", "xbox", "4500", 49.99),
  currencyProduct("Apex Coins", "playstation", "1000", 9.99),
  currencyProduct("Apex Coins", "playstation", "2150", 19.99, 17.99),
  currencyProduct("Apex Coins", "playstation", "4350", 39.99, 35.99),
  currencyProduct("Apex Coins", "playstation", "6700", 59.99, 54.99)
];

export const productCatalog: CatalogSeedItem[] = [
  ...pcGames,
  ...psnCards,
  ...xboxCards,
  ...nintendoCards,
  ...walletTopUps,
  ...subscriptions,
  ...inGameCurrency
];
