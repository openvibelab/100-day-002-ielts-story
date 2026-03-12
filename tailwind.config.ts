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
        accent: {
          gold: "#e8a44a",
          "gold-hover": "#d4922e",
          "gold-subtle": "rgba(232, 164, 74, 0.12)",
        },
        success: {
          sage: "#6bab6e",
        },
        dark: {
          bg: "#1c1915",
          surface: "#262220",
          card: "#302b27",
          border: "#443d36",
        },
        warm: {
          text: "#ede8e0",
          secondary: "#a09585",
          muted: "#7a6f5f",
        },
      },
    },
  },
  plugins: [],
};
export default config;
