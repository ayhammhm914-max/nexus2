import { motion } from "framer-motion";
import { Clock3, Headset, Lock, ShieldCheck, Store, Zap } from "lucide-react";
import arthurArtwork from "../../assets/images/characters/arthur-inspired-outlaw.png";
import radahnArtwork from "../../assets/images/characters/radahn-inspired-warlord.png";
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
      <div className="trust-ember-field" aria-hidden="true" />
      <div className="mx-auto grid max-w-[1880px] grid-cols-1 gap-6 px-4 py-10 sm:px-6 xl:grid-cols-[minmax(220px,330px)_minmax(760px,1120px)_minmax(220px,330px)] xl:items-stretch xl:px-7">
        <motion.aside
          initial={{ opacity: 0, x: -28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="trust-character-panel trust-character-panel-left hidden xl:block"
          aria-hidden="true"
        >
          <img src={radahnArtwork} alt="" className="h-full w-full object-cover" loading="lazy" />
        </motion.aside>

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

        <motion.aside
          initial={{ opacity: 0, x: 28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.08 }}
          className="trust-character-panel trust-character-panel-right hidden xl:block"
          aria-hidden="true"
        >
          <img src={arthurArtwork} alt="" className="h-full w-full object-cover" loading="lazy" />
        </motion.aside>
      </div>
    </section>
  );
};
