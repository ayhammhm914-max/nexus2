import { useAuth } from "../features/auth/context/AuthContext";

export const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <section className="mx-auto min-h-[70vh] max-w-4xl px-4 py-16 sm:px-6">
      <div className="rounded-[32px] border border-white/10 bg-panel/80 p-8 shadow-card">
        <div className="text-sm uppercase tracking-[0.28em] text-primary">Dashboard</div>
        <h1 className="mt-3 font-display text-3xl text-white">
          Welcome{user ? `, ${user.name}` : ""}.
        </h1>
        <p className="mt-4 text-muted">
          Your account is protected by the in-memory access token flow.
        </p>
        <button
          className="mt-8 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-primary/30 hover:text-primary"
          onClick={() => void logout()}
          type="button"
        >
          Log out
        </button>
      </div>
    </section>
  );
};
