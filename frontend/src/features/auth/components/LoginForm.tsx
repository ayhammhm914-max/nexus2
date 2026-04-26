import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import {
  loginSchema,
  type LoginFormValues
} from "../validation/authSchemas";

type LoginFormProps = {
  onSubmit: (values: LoginFormValues) => Promise<void> | void;
  isLoading: boolean;
  error: string | null;
};

export const LoginForm = ({ onSubmit, isLoading, error }: LoginFormProps) => {
  const {
    formState: { errors },
    handleSubmit,
    register
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  return (
    <form
      className="w-full rounded-[32px] border border-white/10 bg-panel p-8 shadow-card"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="text-sm uppercase tracking-[0.28em] text-primary">Account access</div>
      <h1 className="mt-3 font-display text-3xl text-white">Sign in to NEXUS</h1>
      <div className="mt-8 space-y-4">
        <label className="block">
          <span className="sr-only">Email</span>
          <input
            aria-label="Email address"
            placeholder="Email"
            type="email"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none placeholder:text-muted"
            {...register("email")}
          />
          {errors.email ? <p className="mt-2 text-sm text-danger">{errors.email.message}</p> : null}
        </label>
        <label className="block">
          <span className="sr-only">Password</span>
          <input
            aria-label="Password"
            placeholder="Password"
            type="password"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none placeholder:text-muted"
            {...register("password")}
          />
          {errors.password ? (
            <p className="mt-2 text-sm text-danger">{errors.password.message}</p>
          ) : null}
        </label>
      </div>
      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
      <Button className="mt-6 w-full" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>
      <p className="mt-4 text-sm text-muted">
        No account?{" "}
        <Link to="/register" className="text-primary">
          Create one
        </Link>
      </p>
    </form>
  );
};
