import { motion } from "framer-motion";
import { Clock3, Headset, Lock, ShieldCheck, Store, Zap } from "lucide-react";
import { useTranslation } from "../../store/language.store";

const trustCards = [
  {
    icon: ShieldCheck,
    titleKey: "trust.verified.title",
    bodyKey: "trust.verified.body"
  },
  {
    icon: Zap,
    titleKey: "trust.instant.title",
    bodyKey: "trust.instant.body"
  },
  {
    icon: Lock,
    titleKey: "trust.secure.title",
    bodyKey: "trust.secure.body"
  },
  {
    icon: Store,
    titleKey: "trust.seller.title",
    bodyKey: "trust.seller.body"
  },
  {
    icon: Headset,
    titleKey: "trust.support.title",
    bodyKey: "trust.support.body"
  },
  {
    icon: Clock3,
    titleKey: "trust.clarity.title",
    bodyKey: "trust.clarity.body"
  }
] as const;

export const TrustSystem = () => {
  const { t, dir } = useTranslation();
  const metrics = [
    { value: "10K+", label: t("trust.metric.orders") },
    { value: "4.9/5", label: t("trust.metric.rating") },
    { value: "<30s", label: t("trust.metric.delivery") },
    { value: "100%", label: t("trust.metric.stock") }
  ];

  return (
    <section className="relative border-b border-white/10" dir={dir}>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 rounded-[32px] border border-white/10 bg-white/[0.04] p-5 shadow-card lg:grid-cols-4 lg:p-6">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-[24px] border border-white/10 bg-background/50 p-5">
              <div className="font-display text-3xl text-white">{metric.value}</div>
              <div className="mt-2 text-xs uppercase tracking-[0.28em] text-muted">{metric.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {trustCards.map((card, index) => (
            <motion.article
              key={card.titleKey}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 shadow-card"
            >
              <card.icon className="h-5 w-5 text-primary" />
              <h3 className="mt-5 text-lg font-semibold text-white">{t(card.titleKey)}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{t(card.bodyKey)}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};
