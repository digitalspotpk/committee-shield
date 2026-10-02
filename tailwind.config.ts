import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        ink: { 950: "#040706", 900: "#070c0a", 800: "#0c1411", 700: "#13201b" },
        emerald: { glow: "#2bf5a8" },
        gold: { 300: "#ffe08a", 400: "#f8c94a", 500: "#e9ad1c", 600: "#c48a0c" },
      },
      boxShadow: {
        "glow-emerald": "0 0 0 1px rgba(52,211,153,.25), 0 8px 32px -6px rgba(16,185,129,.45)",
        "glow-gold": "0 0 0 1px rgba(248,201,74,.3), 0 8px 32px -6px rgba(233,173,28,.5)",
        frame: "0 0 0 10px #0b0f0e, 0 0 0 11px rgba(255,255,255,.08), 0 40px 120px -20px rgba(16,185,129,.25)",
      },
      keyframes: {
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-6px)" } },
        pulseRing: { "0%": { transform: "scale(.9)", opacity: ".7" }, "100%": { transform: "scale(1.6)", opacity: "0" } },
      },
      animation: {
        shimmer: "shimmer 3s linear infinite",
        float: "float 4s ease-in-out infinite",
        "pulse-ring": "pulseRing 1.8s cubic-bezier(.2,.6,.4,1) infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
