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
        },
        cream: {
          DEFAULT: "#FEFAE0",
          dark: "#F5F0CD",
        },
        sunset: {
          DEFAULT: "#E76F51",
          light: "#F4A261",
        },
        gold: {
          DEFAULT: "#F2A93B",
          light: "#F9C74F",
        },
      },
      borderRadius: {
        card: "16px",
        pill: "999px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      keyframes: {
        pulse_gentle: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.05)", opacity: "0.9" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.15)" },
        },
        fade_in_up: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        grow_plant: {
          "0%": { height: "0%", opacity: "0" },
          "100%": { height: "100%", opacity: "1" },
        },
      },
      animation: {
        pulse_gentle: "pulse_gentle 3s ease-in-out infinite",
        breathe: "breathe 4s ease-in-out infinite",
        fade_in_up: "fade_in_up 0.6s ease-out forwards",
        grow_plant: "grow_plant 2s ease-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
