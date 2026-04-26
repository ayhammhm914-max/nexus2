import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { useTranslation } from "../store/language.store";

export const NotFoundPage = () => {
  const { t, dir } = useTranslation();

  return (
    <section
      className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 text-center sm:px-6"
      dir={dir}
    >
      <div className="text-sm uppercase tracking-[0.3em] text-primary">404</div>
      <h1 className="mt-4 font-display text-5xl text-white">{t("notFound.title")}</h1>
      <p className="mt-4 max-w-xl text-muted">
        {t("notFound.body")}
      </p>
      <Link to="/" className="mt-8">
        <Button>{t("notFound.return")}</Button>
      </Link>
    </section>
  );
};
