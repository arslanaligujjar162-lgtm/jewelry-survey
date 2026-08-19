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
          sky: "#8FC6DE",
          "sky-dark": "#5FA0C2",
          "sky-light": "#DDF0F7",
          umber: "#5C3A21",
          "umber-light": "#7A4F30",
          "umber-dark": "#3E2716",
          butter: "#F3E3A6",
          "butter-light": "#FBF3D6",
          ivory: "#FBF7EE",
          charcoal: "#231F1C",
          brass: "#B8925A",
          blush: "#D98E73",
          success: "#4C7A5A",
          error: "#B23B2E",
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
