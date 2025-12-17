import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--border))",
        ring: "hsl(var(--border-hover))",
        primary: {
          DEFAULT: "hsl(var(--text-primary))",
          foreground: "hsl(var(--bg-primary))",
        },
        secondary: {
          DEFAULT: "hsl(var(--bg-secondary))",
          foreground: "hsl(var(--text-secondary))",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "hsl(var(--bg-tertiary))",
          foreground: "hsl(var(--text-tertiary))",
        },
        accent: {
          DEFAULT: "hsl(var(--bg-tertiary))",
          foreground: "hsl(var(--text-secondary))",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    plugin(function({ addVariant }) {
      addVariant('light', 'html.light &')
    })
  ],
};

export default config;
