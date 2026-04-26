import type { CSSProperties } from "react";
import { useTranslation } from "../../store/language.store";

type FloatingCard = {
  className: string;
  theme: string;
  delay: string;
  startTransform: string;
  midTransform: string;
  image: string;
  platform: string;
  price: string;
  discount: string;
};

const cards: FloatingCard[] = [
  {
    className: "left-[3%] top-[12%] h-44 w-28 sm:h-56 sm:w-36",
    theme: "hero-video-card-cyan",
    delay: "-1.2s",
    startTransform: "translate3d(0, 0, 0) rotate(-13deg) rotateY(18deg) rotateX(5deg)",
    midTransform: "translate3d(22px, -18px, 72px) rotate(-8deg) rotateY(-10deg) rotateX(-4deg)",
    image: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1091500/library_600x900_2x.jpg",
    platform: "Steam",
    price: "$42.99",
    discount: "-28%"
  },
  {
    className: "left-[8%] bottom-[7%] h-36 w-24 sm:h-48 sm:w-32",
    theme: "hero-video-card-violet",
    delay: "-4.8s",
    startTransform: "translate3d(0, 0, 0) rotate(10deg) rotateY(-14deg) rotateX(4deg)",
    midTransform: "translate3d(-16px, 20px, 54px) rotate(4deg) rotateY(12deg) rotateX(-5deg)",
    image: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1245620/library_600x900_2x.jpg",
    platform: "Steam",
    price: "$47.99",
    discount: "-20%"
  },
  {
    className: "right-[5%] top-[10%] h-40 w-28 sm:h-60 sm:w-40",
    theme: "hero-video-card-blue",
    delay: "-2.6s",
    startTransform: "translate3d(0, 0, 0) rotate(15deg) rotateY(-20deg) rotateX(3deg)",
    midTransform: "translate3d(-28px, -16px, 80px) rotate(9deg) rotateY(14deg) rotateX(-4deg)",
    image: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1551360/library_600x900_2x.jpg",
    platform: "Xbox",
    price: "$38.99",
    discount: "-35%"
  },
  {
    className: "right-[11%] bottom-[9%] h-36 w-24 sm:h-52 sm:w-36",
    theme: "hero-video-card-teal",
    delay: "-6.1s",
    startTransform: "translate3d(0, 0, 0) rotate(-9deg) rotateY(16deg) rotateX(4deg)",
    midTransform: "translate3d(18px, 22px, 66px) rotate(-15deg) rotateY(-12deg) rotateX(-5deg)",
    image: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/990080/library_600x900_2x.jpg",
    platform: "Steam",
    price: "$34.99",
    discount: "-42%"
  },
  {
    className: "left-[32%] top-[2%] h-28 w-20 opacity-60 sm:h-40 sm:w-28",
    theme: "hero-video-card-ghost",
    delay: "-3.4s",
    startTransform: "translate3d(0, 0, 0) rotate(22deg) rotateY(-12deg) rotateX(6deg)",
    midTransform: "translate3d(12px, -16px, 42px) rotate(15deg) rotateY(10deg) rotateX(-3deg)",
    image: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/292030/library_600x900_2x.jpg",
    platform: "Steam",
    price: "$8.99",
    discount: "-78%"
  },
  {
    className: "right-[31%] bottom-[1%] h-28 w-20 opacity-55 sm:h-40 sm:w-28",
    theme: "hero-video-card-ghost",
    delay: "-7.3s",
    startTransform: "translate3d(0, 0, 0) rotate(-20deg) rotateY(10deg) rotateX(5deg)",
    midTransform: "translate3d(-14px, 12px, 38px) rotate(-13deg) rotateY(-9deg) rotateX(-4deg)",
    image: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1174180/library_600x900_2x.jpg",
    platform: "Steam",
    price: "$24.99",
    discount: "-58%"
  }
];

const particles = Array.from({ length: 20 }, (_, index) => ({
  className:
    index % 2 === 0
      ? "left-[var(--particle-x)] top-[var(--particle-y)]"
      : "right-[var(--particle-x)] bottom-[var(--particle-y)]",
  style: {
    "--particle-x": `${6 + ((index * 17) % 39)}%`,
    "--particle-y": `${5 + ((index * 23) % 42)}%`,
    animationDelay: `${index * -0.42}s`
  } as CSSProperties
}));

export const HeroCinematicBackground = () => {
  const { t } = useTranslation();

  return (
    <div className="hero-cinematic pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="hero-cinematic-camera absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(4,6,12,0.98)_0%,rgba(4,6,12,0.92)_34%,rgba(4,6,12,0.48)_57%,rgba(4,6,12,0.12)_78%,transparent_100%)]" />
        <div className="absolute inset-0 bg-grid bg-[size:72px_72px] opacity-[0.055]" />
        <div className="hero-light-streak hero-light-streak-a" />
        <div className="hero-light-streak hero-light-streak-b" />

        {cards.map((card, index) => (
          <div
            key={`${card.theme}-${index}`}
            className={`hero-video-card absolute ${card.className} ${card.theme}`}
            style={
              {
                "--card-start-transform": card.startTransform,
                "--card-mid-transform": card.midTransform,
                animationDelay: card.delay
              } as CSSProperties
            }
          >
            <img src={card.image} alt="" className="hero-video-card-cover" loading="lazy" />
            <div className="hero-video-card-shade" />
            <div className="hero-video-card-top">
              <span>{card.platform}</span>
              <strong>{card.discount}</strong>
            </div>
            <div className="hero-video-card-bottom">
              <span>{t("product.instant")}</span>
              <strong>{card.price}</strong>
            </div>
            <div className="hero-video-card-gloss" />
          </div>
        ))}

        {particles.map((particle, index) => (
          <span key={index} className={`hero-video-particle absolute ${particle.className}`} style={particle.style} />
        ))}
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,8,16,0.36),rgba(5,8,16,0.08)_18%,rgba(5,8,16,0.72)_46%,rgba(5,8,16,0.46)_68%,rgba(5,8,16,0.24))]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
};
