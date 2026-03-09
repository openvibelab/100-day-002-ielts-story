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
        neon: {
          blue: "#00d4ff",
          green: "#39ff14",
          purple: "#bf5af2",
        },
        dark: {
          bg: "#0a0a0f",
          surface: "#12121a",
          card: "#1a1a2e",
          border: "#2a2a3e",
        },
      },
    },
  },
  plugins: [],
};
export default config;
