import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#12050A",
        panel: "#1C0A11",
        line: "#3B1B24",
        muted: "#A18B88",
        soft: "#CDBDB3",
        cream: "#F6EDDA",
        accent: "#E3C17A",
        indigo: "#9A2240",
        gold: "#C9A45C",
        goldsoft: "#EBD9A8",
        golddeep: "#8F6D2E",
        wine: "#6B1428",
        winedeep: "#3A0A15",
        winebright: "#9A2240",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Helvetica", "Arial", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
