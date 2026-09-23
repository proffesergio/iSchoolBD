import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#16324f",
        accent: "#ff6b9d",
        accent2: "#22b07d",
        accent3: "#ffb020",
        cream: "#fffdf4",
        // Minimal course-browser system (Udemy/Khan-inspired)
        canvas: "#F9FAFB",
        charcoal: "#111827",
        mutedslate: "#4B5563",
        indigoaccent: "#4F46E5",
        midnight: "#1E3A8A",
        hairline: "#E5E7EB",
      },
      fontSize: {
        // 1.25 scale on 16px base
        h1: ["31.25px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" }],
        h2: ["25px", { lineHeight: "1.3", fontWeight: "600" }],
        h3: ["20px", { lineHeight: "1.4", fontWeight: "600" }],
        body: ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        caption: ["12px", { lineHeight: "1.5", fontWeight: "600" }],
      },
      fontFamily: {
        bengali: ['"Hind Siliguri"', '"Noto Sans Bengali"', "system-ui", "sans-serif"],
      },
      keyframes: {
        floaty: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-5px)" } },
        pop: { from: { transform: "scale(.7)", opacity: "0" }, to: { transform: "scale(1)", opacity: "1" } },
      },
      animation: {
        floaty: "floaty 2.6s ease-in-out infinite",
        pop: "pop .25s ease",
      },
    },
  },
  plugins: [],
};

export default config;
