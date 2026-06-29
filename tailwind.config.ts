import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        field: "#1f3a3d",
        alert: "#b42318",
        signal: "#2563eb",
        sand: "#e4d7c5"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(17, 24, 39, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;

