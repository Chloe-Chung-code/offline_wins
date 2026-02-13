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
        forest: {
          DEFAULT: "#1B4332",
          light: "#2D6A4F",
          dark: "#081C15",
          muted: "#D8F3DC",
        },
        cream: {
          DEFAULT: "#FEFAE0",
          dark: "#F5F0CD",
          warm: "#FFF8E7",
        },
        sunset: {
          DEFAULT: "#E76F51",
          light: "#F4A261",
        },
        gold: {
          DEFAULT: "#F2A93B",
          light: "#F9C74F",
        },
        brand: {
          light: "#95D5B2",
          muted: "#D8F3DC",
        },
        muted: "#95A5A0",
        secondary: "#52796F",
      },
      borderRadius: {
        sm: "12px",
        card: "16px",
        lg: "24px",
        pill: "9999px",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 12px rgba(27, 67, 50, 0.06)",
        medium: "0 4px 20px rgba(27, 67, 50, 0.10)",
        button: "0 4px 24px rgba(27, 67, 50, 0.25)",
      },
      keyframes: {
        pulse_gentle: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.02)" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.3" },
          "50%": { transform: "scale(1.1)", opacity: "0.15" },
        },
        fade_in_up: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        pulse_gentle: "pulse_gentle 3s ease-in-out infinite",
        breathe: "breathe 6s ease-in-out infinite",
        fade_in_up: "fade_in_up 0.4s ease-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
