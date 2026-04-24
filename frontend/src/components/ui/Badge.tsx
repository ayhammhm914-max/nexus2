import type { PropsWithChildren } from "react";
import { clsx } from "clsx";

export const Badge = ({
  children,
  tone = "default"
}: PropsWithChildren<{ tone?: "default" | "danger" | "accent" | "gold" }>) => (
  <span
    className={clsx(
      "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]",
      tone === "default" && "border-white/10 bg-white/5 text-muted",
      tone === "danger" && "border-danger/20 bg-danger/10 text-danger",
      tone === "accent" && "border-accent/20 bg-accent/10 text-accent",
      tone === "gold" && "border-gold/20 bg-gold/10 text-gold"
    )}
  >
    {children}
  </span>
);

