/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        premium: {
          black: '#020617',    // Deepest Navy-Black
          slate: '#0f172a',    // Dark Slate for Cards
          gold: '#c5a059',     // Refined Champagne Gold (Not too bright)
          goldLight: '#e2c28a', // Soft gold for hover states
        }
      },
      boxShadow: {
        'soft-gold': '0 0 15px rgba(197, 160, 89, 0.1)', // Very subtle glow
      }
    },
  },
  plugins: [],
}
