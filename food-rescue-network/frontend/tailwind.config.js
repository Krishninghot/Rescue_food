/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        forest: { DEFAULT: "#123524", light: "#1B5E42", dark: "#0B2318" },
        paper: "#F6F4EA",
        mist: "#EBE7D6",
        ink: "#1C1B18",
        gold: { DEFAULT: "#E3A72E", light: "#F2C666", dark: "#B9820F" },
        clay: { DEFAULT: "#C1502E", light: "#DD7A54" },
        mint: "#4C9A6E",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        soft: "0 8px 30px -12px rgba(18, 53, 36, 0.25)",
      },
      backgroundImage: {
        "grain": "radial-gradient(circle, rgba(0,0,0,0.035) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
