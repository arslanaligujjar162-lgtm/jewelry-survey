import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          // Locked primaries — print-safe (7teen2wenty brand guide)
          sky: "#5FA8C2", // Retro Sky Blue
          "sky-dark": "#3E6D7E",
          "sky-light": "#E7F2F6",
          umber: "#673C34", // Umber Brown
          "umber-light": "#AB948F",
          "umber-dark": "#482A24",
          butter: "#FAE3B1", // Pale Butter Yellow
          "butter-light": "#FDF2DC",
          ivory: "#FBF7EE",
          charcoal: "#231F1C",
          // Locked accents — digital-only (never print/packaging)
          brass: "#998731", // Olive / Mustard Gold
          blush: "#CF5527", // Burnt Orange
          success: "#4C7A5A",
          error: "#7D2027", // Brick Red / Maroon
        },
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "serif"],
        body: ["var(--font-montserrat)", "sans-serif"],
      },
      maxWidth: {
        "8xl": "90rem",
      },
    },
  },
  plugins: [],
};
export default config;
