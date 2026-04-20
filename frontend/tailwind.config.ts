import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#1e1e2e",
        mantle: "#181825",
        crust: "#11111b",
        surface0: "#313244",
        surface1: "#45475a",
        surface2: "#585b70",
        overlay0: "#6c7086",
        text: "#cdd6f4",
        subtext: "#a6adc8",
        blue: "#89b4fa",
        lavender: "#b4befe",
        mauve: "#cba6f7",
        green: "#a6e3a1",
        yellow: "#f9e2af",
        red: "#f38ba8",
        peach: "#fab387",
      },
    },
  },
  plugins: [],
} satisfies Config;
