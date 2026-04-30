import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { authRedirectUrl } from "../../../lib/api";
import { useTranslation } from "../../../store/language.store";
import {
  createSignUpSchema,
  type SignUpFormValues
} from "../validation/authSchemas";

type SignUpFormProps = {
  onSubmit: (values: SignUpFormValues) => Promise<void> | void;
  isLoading: boolean;
  error: string | null;
  success: string | null;
};

export const SignUpForm = ({ onSubmit, isLoading, error, success }: SignUpFormProps) => {
  const { t, dir } = useTranslation();
  const signUpSchema = useMemo(() => createSignUpSchema(t), [t]);
  const {
    formState: { errors },
    handleSubmit,
    register
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema)
  });

  return (
    <form
      className="w-full rounded-[32px] border border-white/10 bg-panel p-8 shadow-card"
      onSubmit={handleSubmit(onSubmit)}
      dir={dir}
    >
      <div className="text-sm uppercase tracking-[0.28em] text-primary">{t("auth.joinVault")}</div>
      <h1 className="mt-3 font-display text-3xl text-white">{t("auth.createTitle")}</h1>
      <div className="mt-8 space-y-4">
        <label className="block">
          <span className="sr-only">{t("auth.name")}</span>
          <input
            aria-label={t("auth.name")}
            placeholder={t("auth.name")}
            type="text"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none placeholder:text-muted"
            {...register("name")}
          />
          {errors.name ? <p className="mt-2 text-sm text-danger">{errors.name.message}</p> : null}
        </label>
        <label className="block">
          <span className="sr-only">{t("auth.email")}</span>
          <input
            aria-label={t("auth.emailAddress")}
            placeholder={t("auth.email")}
            type="email"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none placeholder:text-muted"
            {...register("email")}
          />
          {errors.email ? <p className="mt-2 text-sm text-danger">{errors.email.message}</p> : null}
        </label>
        <label className="block">
          <span className="sr-only">{t("auth.password")}</span>
          <input
            aria-label={t("auth.password")}
            placeholder={t("auth.password")}
            type="password"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none placeholder:text-muted"
            {...register("password")}
          />
          {errors.password ? (
            <p className="mt-2 text-sm text-danger">{errors.password.message}</p>
          ) : null}
        </label>
        <label className="block">
          <span className="sr-only">{t("auth.confirmPassword")}</span>
          <input
            aria-label={t("auth.confirmPassword")}
            placeholder={t("auth.confirmPassword")}
            type="password"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none placeholder:text-muted"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword ? (
            <p className="mt-2 text-sm text-danger">{errors.confirmPassword.message}</p>
          ) : null}
        </label>
      </div>
      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
      {success ? <p className="mt-4 text-sm text-accent">{success}</p> : null}
      <Button className="mt-6 w-full" disabled={isLoading}>
        {isLoading ? t("auth.creating") : t("auth.createAccount")}
      </Button>
      <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-muted">
        <span className="h-px flex-1 bg-white/10" />
        {t("auth.or")}
        <span className="h-px flex-1 bg-white/10" />
      </div>
      <button
        type="button"
        className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 font-semibold text-white transition duration-200 hover:border-primary/40 hover:bg-primary/10"
        onClick={() => window.location.assign(authRedirectUrl("/auth/google"))}
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-black text-slate-950">
          G
        </span>
        {t("auth.continueWithGoogle")}
      </button>
      <p className="mt-4 text-sm text-muted">
        {t("auth.alreadyRegistered")}{" "}
        <Link to="/login" className="text-primary">
          {t("auth.signIn")}
        </Link>
      </p>
    </form>
  );
};
