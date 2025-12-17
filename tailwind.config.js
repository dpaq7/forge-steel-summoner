/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Map shadcn semantic colors to Mettle CSS variables
        border: "var(--border-solid)",
        input: "var(--bg-darkest)",
        ring: "var(--accent-glow)",
        background: "var(--bg-dark)",
        foreground: "var(--text-primary)",
        primary: {
          DEFAULT: "var(--accent-bright)",
          foreground: "var(--bg-darkest)",
        },
        secondary: {
          DEFAULT: "var(--bg-medium)",
          foreground: "var(--text-primary)",
        },
        destructive: {
          DEFAULT: "var(--danger)",
          foreground: "var(--text-primary)",
        },
        muted: {
          DEFAULT: "var(--bg-dark)",
          foreground: "var(--text-muted)",
        },
        accent: {
          DEFAULT: "var(--accent-dim)",
          foreground: "var(--accent-bright)",
        },
        popover: {
          DEFAULT: "var(--bg-card)",
          foreground: "var(--text-primary)",
        },
        card: {
          DEFAULT: "var(--bg-card)",
          foreground: "var(--text-primary)",
        },
        // Mettle-specific colors
        mettle: {
          cyan: {
            bright: "var(--accent-bright)",
            glow: "var(--accent-glow)",
            soft: "var(--accent-soft)",
            dim: "var(--accent-dim)",
          },
          bg: {
            darkest: "var(--bg-darkest)",
            dark: "var(--bg-dark)",
            medium: "var(--bg-medium)",
            light: "var(--bg-light)",
            hover: "var(--bg-hover)",
          },
          text: {
            primary: "var(--text-primary)",
            secondary: "var(--text-secondary)",
            bone: "var(--text-bone)",
            muted: "var(--text-muted)",
          },
          success: "var(--success)",
          danger: "var(--danger)",
          warning: "var(--warning)",
          essence: "var(--essence)",
          xp: "var(--xp)",
        },
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
        xl: "var(--radius-xl)",
      },
      fontFamily: {
        display: ["Cinzel", "Times New Roman", "Georgia", "serif"],
        body: ["Source Sans 3", "system-ui", "-apple-system", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "var(--shadow-glow)" },
          "50%": { boxShadow: "var(--shadow-glow-strong)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
