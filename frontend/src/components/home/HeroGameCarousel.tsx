import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../../store/language.store";
import type { Product } from "../../types/product.types";
import { calculateDiscount, formatCurrency } from "../../utils/format";

type ShowcaseItem = {
  name: string;
  to: string;
  coverImageUrl: string;
  platformName: string;
  platformColor: string;
  basePrice: number;
  salePrice?: number | null;
};

const steamCover = (appId: number) =>
  `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appId}/library_600x900_2x.jpg`;

const fallbackItems: ShowcaseItem[] = [
  { name: "Elden Ring", to: "/store?q=Elden%20Ring", coverImageUrl: steamCover(1245620), platformName: "Steam", platformColor: "#00D4FF", basePrice: 59.99, salePrice: 47.99 },
  { name: "Forza Horizon 5", to: "/store?q=Forza%20Horizon%205", coverImageUrl: steamCover(1551360), platformName: "Xbox", platformColor: "#00FF88", basePrice: 59.99, salePrice: 38.99 },
  { name: "Hogwarts Legacy", to: "/store?q=Hogwarts%20Legacy", coverImageUrl: steamCover(990080), platformName: "Steam", platformColor: "#00D4FF", basePrice: 59.99, salePrice: 34.99 },
  { name: "The Witcher 3", to: "/store?q=The%20Witcher%203", coverImageUrl: steamCover(292030), platformName: "Steam", platformColor: "#00D4FF", basePrice: 39.99, salePrice: 8.99 },
  { name: "Cyberpunk 2077", to: "/store?q=Cyberpunk%202077", coverImageUrl: steamCover(1091500), platformName: "Steam", platformColor: "#00D4FF", basePrice: 59.99, salePrice: 42.99 },
  { name: "GTA V", to: "/store?q=GTA%20V", coverImageUrl: steamCover(271590), platformName: "Steam", platformColor: "#00D4FF", basePrice: 29.99, salePrice: 14.99 },
  { name: "Red Dead Redemption 2", to: "/store?q=Red%20Dead%20Redemption%202", coverImageUrl: steamCover(1174180), platformName: "Steam", platformColor: "#00D4FF", basePrice: 59.99, salePrice: 24.99 },
  { name: "EA Sports FC 24", to: "/store?q=EA%20Sports%20FC%2024", coverImageUrl: "https://placehold.co/600x900/101827/00D4FF?text=FC+24", platformName: "EA", platformColor: "#FB923C", basePrice: 59.99, salePrice: 27.99 },
  { name: "Call of Duty Modern Warfare III", to: "/store?q=Call%20of%20Duty", coverImageUrl: "https://placehold.co/600x900/0B1020/60A5FA?text=CALL+OF+DUTY", platformName: "Steam", platformColor: "#60A5FA", basePrice: 69.99, salePrice: 54.99 },
  { name: "Minecraft", to: "/store?q=Minecraft", coverImageUrl: "https://placehold.co/600x900/052E16/4ADE80?text=MINECRAFT", platformName: "PC", platformColor: "#4ADE80", basePrice: 29.99, salePrice: 24.99 },
  { name: "Assassin's Creed Mirage", to: "/store?q=Assassin%27s%20Creed%20Mirage", coverImageUrl: "https://placehold.co/600x900/111827/00D4FF?text=ASSASSIN%27S+CREED+MIRAGE", platformName: "Ubisoft", platformColor: "#93C5FD", basePrice: 49.99, salePrice: 31.99 },
  { name: "Resident Evil 4 Remake", to: "/store?q=Resident%20Evil%204", coverImageUrl: steamCover(2050650), platformName: "Steam", platformColor: "#00D4FF", basePrice: 59.99, salePrice: 29.99 },
  { name: "Starfield", to: "/store?q=Starfield", coverImageUrl: steamCover(1716740), platformName: "Steam", platformColor: "#00D4FF", basePrice: 69.99, salePrice: 45.99 },
  { name: "Rust", to: "/store?q=Rust", coverImageUrl: steamCover(252490), platformName: "Steam", platformColor: "#00D4FF", basePrice: 39.99, salePrice: 26.99 },
  { name: "Terraria", to: "/store?q=Terraria", coverImageUrl: steamCover(105600), platformName: "Steam", platformColor: "#00D4FF", basePrice: 9.99, salePrice: 4.99 },
  { name: "Hades", to: "/store?q=Hades", coverImageUrl: steamCover(1145360), platformName: "Steam", platformColor: "#00D4FF", basePrice: 24.99, salePrice: 11.99 },
  { name: "Sea of Thieves", to: "/store?q=Sea%20of%20Thieves", coverImageUrl: steamCover(1172620), platformName: "Xbox", platformColor: "#00FF88", basePrice: 39.99, salePrice: 19.99 },
  { name: "Battlefield 2042", to: "/store?q=Battlefield%202042", coverImageUrl: steamCover(1517290), platformName: "EA", platformColor: "#FB923C", basePrice: 59.99, salePrice: 14.99 }
];

const targetNames = fallbackItems.map((item) => item.name);

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "");

const toShowcaseItem = (product: Product): ShowcaseItem => ({
  name: product.name,
  to: `/products/${product.slug}`,
  coverImageUrl: product.coverImageUrl ?? product.thumbnailUrl ?? "",
  platformName: product.platform.name,
  platformColor: product.platform.color ?? "#00D4FF",
  basePrice: Number(product.basePrice),
  salePrice: product.salePrice ? Number(product.salePrice) : null
});

const getShowcaseItems = (products: Product[]) =>
  targetNames.map((name, index) => {
    const target = normalize(name);
    const match = products.find((product) => {
      const normalizedProduct = normalize(product.name);
      return normalizedProduct.includes(target) || target.includes(normalizedProduct);
    });

    return match ? toShowcaseItem(match) : fallbackItems[index];
  });

const cardColumns = (items: ShowcaseItem[]) => [
  [items[4], items[0], items[10], items[7], items[2], items[14]],
  [items[1], items[11], items[5], items[3], items[8], items[6]],
  [items[12], items[2], items[6], items[15], items[0], items[9]],
  [items[7], items[16], items[3], items[17], items[13], items[5]]
];

const HeroVaultCard = ({
  item,
  compact = false
}: {
  item: ShowcaseItem;
  compact?: boolean;
}) => {
  const { t } = useTranslation();
  const discount = calculateDiscount(item.basePrice, item.salePrice);
  const price = item.salePrice ?? item.basePrice;

  return (
    <Link
      to={item.to}
      className={compact ? "hero-vault-card hero-vault-card-compact" : "hero-vault-card"}
      style={{ "--platform-color": item.platformColor } as CSSProperties}
      aria-label={`${t("product.openDetails")}: ${item.name}`}
    >
      <img src={item.coverImageUrl} alt={item.name} loading="lazy" />
      <div className="hero-vault-card-shade" />
      <div className="hero-vault-card-top">
        <span>{item.platformName}</span>
        {discount ? <strong>-{discount}%</strong> : null}
      </div>
      <div className="hero-vault-card-bottom">
        <span>{t("product.instant")}</span>
        <strong>{formatCurrency(price)}</strong>
      </div>
    </Link>
  );
};

export const HeroGameCarousel = ({ products }: { products: Product[] }) => {
  const { t } = useTranslation();
  const showcaseItems = getShowcaseItems(products);
  const columns = cardColumns(showcaseItems);

  return (
    <div className="relative z-10 w-full" aria-label={t("hero.carousel.label")}>
      <div className="hero-vault-desktop hidden h-[760px] lg:block">
        <div className="hero-vault-stage">
          <div className="hero-vault-ring" />
          {columns.map((column, index) => (
            <div key={index} className={`hero-vault-column hero-vault-column-${index + 1}`}>
              <div
                className="hero-vault-track"
                style={{ animationDelay: `${index * -3.6}s` } as CSSProperties}
              >
                {[...column, ...column].map((item, cardIndex) => (
                  <HeroVaultCard key={`${item.name}-${cardIndex}`} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hero-vault-tablet hidden overflow-hidden md:block lg:hidden">
        <div className="hero-vault-rail">
          {[...showcaseItems, ...showcaseItems].map((item, index) => (
            <HeroVaultCard key={`${item.name}-tablet-${index}`} item={item} compact />
          ))}
        </div>
      </div>

      <div className="hide-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 md:hidden">
        {showcaseItems.map((item) => (
          <div key={item.name} className="w-[42vw] min-w-[150px] snap-start">
            <HeroVaultCard item={item} compact />
          </div>
        ))}
      </div>
    </div>
  );
};
