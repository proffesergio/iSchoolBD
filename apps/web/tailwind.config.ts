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
