/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          pink: "var(--brand-pink)",
          rose: "var(--brand-rose)",
          purple: "var(--brand-purple)",
          lavender: "var(--brand-lavender)",
        },
      },
      boxShadow: {
        beautySm: "var(--shadow-sm)",
        beautyMd: "var(--shadow-md)",
        beautyLg: "var(--shadow-lg)",
        beautyXl: "var(--shadow-xl)",
      },
      borderRadius: {
        beautySm: "var(--radius-sm)",
        beautyMd: "var(--radius-md)",
        beautyLg: "var(--radius-lg)",
        beautyXl: "var(--radius-xl)",
      },
    },
  },
  darkMode: "media", // চাইলে 'class'
  plugins: [],
};
