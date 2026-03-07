import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        for: {
          DEFAULT: "#3b82f6",
          light: "#eff6ff",
          border: "#bfdbfe",
        },
        against: {
          DEFAULT: "#ef4444",
          light: "#fef2f2",
          border: "#fecaca",
        },
        judge: {
          DEFAULT: "#8b5cf6",
          light: "#f5f3ff",
          border: "#ddd6fe",
        },
      },
    },
  },
  plugins: [],
};

export default config;
