import { Star } from "lucide-react";
import { useTranslation } from "../../store/language.store";

const quotes = [
  {
    quoteKey: "proof.quote1",
    author: "Omar K.",
    roleKey: "proof.role1"
  },
  {
    quoteKey: "proof.quote2",
    author: "Leah T.",
    roleKey: "proof.role2"
  },
  {
    quoteKey: "proof.quote3",
    author: "Daniel S.",
    roleKey: "proof.role3"
  }
] as const;

export const SocialProof = () => {
  const { t, dir } = useTranslation();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6" dir={dir}>
      <div className="rounded-[36px] border border-white/10 bg-white/[0.04] p-6 shadow-card sm:p-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <div className="text-xs uppercase tracking-[0.34em] text-primary">{t("proof.eyebrow")}</div>
            <h2 className="mt-3 font-display text-3xl text-white">
              {t("proof.title")}
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              {t("proof.body")}
            </p>
            <div className="mt-6 flex items-center gap-2 text-gold">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="h-4 w-4 fill-current" />
              ))}
              <span className="ml-2 text-sm text-white">{t("proof.rating")}</span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {quotes.map((quote) => (
              <article
                key={quote.author}
                className="rounded-[28px] border border-white/10 bg-background/55 p-6"
              >
                <p className="text-sm leading-7 text-slate-100">"{t(quote.quoteKey)}"</p>
                <div className="mt-6 text-sm font-semibold text-white">{quote.author}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.22em] text-muted">
                  {t(quote.roleKey)}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
