import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { clsx } from "clsx";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "ghost" | "secondary";
  }
>;

export const Button = ({ children, className, variant = "primary", ...props }: ButtonProps) => {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "bg-primary text-slate-950 shadow-glow-blue hover:-translate-y-0.5 hover:shadow-card-hover",
        variant === "secondary" &&
          "bg-secondary text-white shadow-glow-purple hover:-translate-y-0.5",
        variant === "ghost" &&
          "border border-white/12 bg-white/5 text-ink hover:border-primary/40 hover:bg-white/10",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

