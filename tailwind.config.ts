import type { Config } from "tailwindcss";
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        "surface-light": "#FFFFFF",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        accent: "var(--accent)",
        success: "var(--success)",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "system-ui", "sans-serif"],
      },
      keyframes: {
        "breathing-glow": {
          "0%, 100%": { transform: "scale(1)", borderColor: "rgba(99, 102, 241, 0.1)", boxShadow: "0 0 0 0 rgba(99, 102, 241, 0)" },
          "50%": { transform: "scale(1.05)", borderColor: "rgba(99, 102, 241, 0.3)", boxShadow: "0 0 20px 0 rgba(99, 102, 241, 0.2)" },
        },
        "ripple-expand": {
          "0%": { transform: "scale(0)", opacity: "1" },
          "100%": { transform: "scale(4)", opacity: "0" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.1)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "gentle-glow": {
          "0%, 100%": { boxShadow: "0 0 8px 0 rgba(59, 130, 246, 0.15)" },
          "50%": { boxShadow: "0 0 20px 4px rgba(59, 130, 246, 0.25)" },
        },
      },
      animation: {
        "breathing-glow": "breathing-glow 4s ease-in-out infinite",
        "ripple-expand": "ripple-expand 1.5s cubic-bezier(0, 0, 0.2, 1) forwards",
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
        "gentle-glow": "gentle-glow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
