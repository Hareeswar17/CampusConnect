import daisyui from "daisyui";
import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        brand: {
          500: "#3b82f6",
          600: "#6366f1",
        },
        wa: {
          green: "#00a884",
          "green-dark": "#005c4b",
          teal: "#008069",
          "teal-deep": "#00a884",
          "header-light": "#008069",
          "header-dark": "#202c33",
          "panel-light": "#ffffff",
          "panel-dark": "#111b21",
          "chat-light": "#efeae2",
          "chat-dark": "#0b141a",
          "input-light": "#f0f2f5",
          "input-dark": "#202c33",
          "outgoing-light": "#d9fdd3",
          "outgoing-dark": "#005c4b",
          "incoming-light": "#ffffff",
          "incoming-dark": "#202c33",
          "border-light": "#e9edef",
          "border-dark": "#313d45",
          "hover-light": "#f0f2f5",
          "hover-dark": "#2a3942",
          "search-light": "#f0f2f5",
          "search-dark": "#202c33",
          "icon-light": "#54656f",
          "icon-dark": "#aebac1",
          "text-primary-light": "#111b21",
          "text-primary-dark": "#e9edef",
          "text-secondary-light": "#667781",
          "text-secondary-dark": "#8696a0",
        },
      },
    },
  },
  plugins: [daisyui],
};
