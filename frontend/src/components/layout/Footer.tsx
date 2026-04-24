export const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-panel/70">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="font-display text-2xl tracking-[0.3em] text-white">NEXUS</div>
          <p className="mt-4 max-w-md text-sm leading-7 text-muted">
            Premium digital delivery for game keys, wallet top-ups, subscriptions and live deals.
            Built as a focused single-seller store with safer inventory controls.
          </p>
        </div>
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.24em] text-white">Store</div>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li>Steam</li>
            <li>Xbox</li>
            <li>PlayStation</li>
            <li>Subscriptions</li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.24em] text-white">Trust</div>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li>Encrypted key inventory</li>
            <li>Server-side pricing</li>
            <li>Authenticated order vault</li>
            <li>Single-seller support</li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

