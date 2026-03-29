/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        "dm-sans": ["DM Sans", "sans-serif"],
        playfair: ["Playfair Display", "serif"],
      },
      colors: {
        brand: {
          dark: "#332e28",
          primary: "#7b7267",
          "primary-dark": "#675f56",
          cream: "#faf4e6",
          "cream-light": "#fffdf1",
          charcoal: "#383838",
        },
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};
