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
    <section className="trust-cinematic-section relative overflow-hidden border-b border-white/10">
      <div className="mx-auto max-w-[1240px] px-4 py-10 sm:px-6 xl:px-7">
        <div className="trust-content-shell relative z-10" dir={dir}>
          <div className="trust-metrics-panel grid gap-4 p-5 lg:grid-cols-4 lg:p-6">
            {metrics.map((metric) => (
              <div key={metric.label} className="trust-metric-card group p-5">
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
                className="trust-feature-card group p-6"
              >
                <span className="trust-icon-tile">
                  <card.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-white">{t(card.titleKey)}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{t(card.bodyKey)}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
