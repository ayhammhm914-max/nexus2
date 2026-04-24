import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "../components/ui/Button";
import { useAuthStore } from "../store/auth.store";

export const LoginPage = () => {
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-16 sm:px-6">
      <form
        className="w-full rounded-[32px] border border-white/10 bg-panel p-8 shadow-card"
        onSubmit={async (event) => {
          event.preventDefault();
          try {
            await login(form);
            toast.success("Welcome back.");
            navigate("/");
          } catch (error) {
            toast.error("Login failed.");
          }
        }}
      >
        <div className="text-sm uppercase tracking-[0.28em] text-primary">Account access</div>
        <h1 className="mt-3 font-display text-3xl text-white">Sign in to NEXUS</h1>
        <div className="mt-8 space-y-4">
          <input
            aria-label="Email address"
            placeholder="Email"
            type="email"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none placeholder:text-muted"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
          <input
            aria-label="Password"
            placeholder="Password"
            type="password"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none placeholder:text-muted"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          />
        </div>
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
    </section>
  );
};
