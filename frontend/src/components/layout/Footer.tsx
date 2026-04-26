import { useTranslation } from "../../store/language.store";

export const Footer = () => {
  const { t, dir } = useTranslation();

  return (
    <footer className="border-t border-white/10 bg-panel/70" dir={dir}>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="font-display text-2xl tracking-[0.3em] text-white">NEXUS</div>
          <p className="mt-4 max-w-md text-sm leading-7 text-muted">
            {t("footer.body")}
          </p>
        </div>
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.24em] text-white">{t("footer.store")}</div>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li>Steam</li>
            <li>Xbox</li>
            <li>PlayStation</li>
            <li>{t("footer.subscriptions")}</li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.24em] text-white">{t("footer.trust")}</div>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li>{t("footer.encrypted")}</li>
            <li>{t("footer.serverPricing")}</li>
            <li>{t("footer.orderVault")}</li>
            <li>{t("footer.singleSeller")}</li>
          </ul>
        </div>
      </div>
    </footer>
  );
};
