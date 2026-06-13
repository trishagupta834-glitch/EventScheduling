/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        royalPurple: "#6B21A8",
        deepViolet: "#4C1D95",
        softGold: "#D4AF37",
        whiteSmoke: "#F5F5F5",
        richBlack: "#0F0F0F",
        mutedGold: "#B8860B",
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
      backgroundImage: {
        'luxury-gradient': "linear-gradient(135deg, #4C1D95 0%, #6B21A8 100%)",
        'gold-shimmer': "linear-gradient(90deg, #D4AF37 0%, #F5DEB3 50%, #D4AF37 100%)",
      }
    },
  },
  plugins: [],
}
