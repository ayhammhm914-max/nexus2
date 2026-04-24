import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0F",
        surface: "#12121B",
        panel: "#181827",
        primary: "#00D4FF",
        secondary: "#7C3AED",
        accent: "#00FF88",
        danger: "#FF3B3B",
        gold: "#FFD700",
        ink: "#E8ECFF",
        muted: "#9AA4D6"
      },
      fontFamily: {
        display: ["Orbitron", "sans-serif"],
        body: ["DM Sans", "sans-serif"]
      },
      boxShadow: {
        "glow-blue": "0 0 0 1px rgba(0,212,255,0.25), 0 18px 48px rgba(0,212,255,0.18)",
        "glow-purple": "0 0 0 1px rgba(124,58,237,0.28), 0 18px 52px rgba(124,58,237,0.18)",
        "glow-green": "0 0 0 1px rgba(0,255,136,0.25), 0 18px 42px rgba(0,255,136,0.16)",
        card: "0 16px 40px rgba(3,8,28,0.55)",
        "card-hover": "0 24px 60px rgba(0,0,0,0.45)"
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
        hex: "radial-gradient(circle at 25% 25%, rgba(0,212,255,0.14), transparent 45%), radial-gradient(circle at 75% 20%, rgba(124,58,237,0.16), transparent 35%), radial-gradient(circle at 50% 85%, rgba(0,255,136,0.12), transparent 38%)",
        circuit: "linear-gradient(115deg, rgba(0,212,255,0.10), transparent 38%), linear-gradient(245deg, rgba(124,58,237,0.10), transparent 40%)"
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem"
      },
      screens: {
        xs: "475px"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 rgba(0,212,255,0.15)" },
          "50%": { boxShadow: "0 0 30px rgba(0,212,255,0.35)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-24px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" }
        },
        "slide-in-right": {
          "0%": { transform: "translateX(24px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" }
        },
        "fade-up": {
          "0%": { transform: "translateY(18px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" }
        },
        "rotate-glow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" }
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        }
      },
      animation: {
        float: "float 5s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2.8s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "slide-in-left": "slide-in-left 0.5s ease-out",
        "slide-in-right": "slide-in-right 0.5s ease-out",
        "fade-up": "fade-up 0.5s ease-out",
        "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
        "rotate-glow": "rotate-glow 14s linear infinite",
        marquee: "marquee 18s linear infinite"
      }
    }
  },
  plugins: []
} satisfies Config;

