import { Gamepad2, Gift, Sparkles, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "../../store/language.store";

const platformCards = [
  {
    to: "/store?category=pc-games",
    titleKey: "platform.card1.title",
    bodyKey: "platform.card1.body",
    labelKey: "platform.card1.label",
    icon: Gamepad2
  },
  {
    to: "/store?category=console-games",
    titleKey: "platform.card5.title",
    bodyKey: "platform.card5.body",
    labelKey: "platform.card5.label",
    icon: Gamepad2
  },
  {
    to: "/store?category=gift-cards",
    titleKey: "platform.card2.title",
    bodyKey: "platform.card2.body",
    labelKey: "platform.card2.label",
    icon: Gift
  },
  {
    to: "/store?category=subscriptions",
    titleKey: "platform.card3.title",
    bodyKey: "platform.card3.body",
    labelKey: "platform.card3.label",
    icon: Sparkles
  },
  {
    to: "/store?category=in-game-currency",
    titleKey: "platform.card4.title",
    bodyKey: "platform.card4.body",
    labelKey: "platform.card4.label",
    icon: Wallet
  }
] as const;

export const PlatformShowcase = () => {
  const { t, dir } = useTranslation();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6" dir={dir}>
      <div className="mb-8 max-w-2xl">
        <div className="text-xs uppercase tracking-[0.34em] text-primary">{t("platform.eyebrow")}</div>
        <h2 className="mt-3 font-display text-3xl text-white sm:text-4xl">
          {t("platform.title")}
        </h2>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {platformCards.map((card) => (
          <Link
            key={card.titleKey}
            to={card.to}
            className="group rounded-[30px] border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-7 shadow-card transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-glow-blue"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-background/60">
              <card.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-6 text-2xl font-semibold text-white">{t(card.titleKey)}</h3>
            <p className="mt-3 max-w-xl text-sm leading-7 text-muted">{t(card.bodyKey)}</p>
            <div className="mt-6 text-sm font-medium text-primary">{t(card.labelKey)}</div>
          </Link>
        ))}
      </div>
    </section>
  );
};
