import { motion } from "framer-motion";
import { CheckCircle2, CreditCard, Download, Gamepad2 } from "lucide-react";
import { useTranslation } from "../../store/language.store";

const steps = [
  {
    icon: Gamepad2,
    titleKey: "how.step1.title",
    bodyKey: "how.step1.body"
  },
  {
    icon: CreditCard,
    titleKey: "how.step2.title",
    bodyKey: "how.step2.body"
  },
  {
    icon: Download,
    titleKey: "how.step3.title",
    bodyKey: "how.step3.body"
  },
  {
    icon: CheckCircle2,
    titleKey: "how.step4.title",
    bodyKey: "how.step4.body"
  }
] as const;

export const HowItWorks = () => {
  const { t, dir } = useTranslation();

  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-16 sm:px-6" dir={dir}>
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="max-w-xl">
          <div className="text-xs uppercase tracking-[0.34em] text-primary">{t("how.eyebrow")}</div>
          <h2 className="mt-3 font-display text-3xl text-white sm:text-4xl">
            {t("how.title")}
          </h2>
          <p className="mt-4 text-base leading-8 text-muted">
            {t("how.body")}
          </p>
          <div className="mt-6 rounded-[28px] border border-primary/20 bg-primary/[0.08] p-6 text-sm leading-7 text-slate-100 shadow-glow-blue">
            {t("how.note")}
            <span className="font-semibold text-white"> {t("hero.delivery.label")}</span>.
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {steps.map((step, index) => (
            <motion.article
              key={step.titleKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6"
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-background/60">
                <step.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="mt-5 text-xs uppercase tracking-[0.24em] text-muted">
                {t("how.stepLabel")} {index + 1}
              </div>
              <h3 className="mt-2 text-xl font-semibold text-white">{t(step.titleKey)}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{t(step.bodyKey)}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};
