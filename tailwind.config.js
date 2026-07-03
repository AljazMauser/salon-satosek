/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FDF8F0',
          100: '#F9EDD8',
          200: '#F2DBB0',
          300: '#E8C47C',
          400: '#D4AF37',
          500: '#C9A96E',
          600: '#B8944A',
          700: '#9A7B3D',
          800: '#7D6332',
          900: '#5F4C26',
        },
        dark: {
          50: '#F5F5F5',
          100: '#E0E0E0',
          200: '#B0B0B0',
          300: '#808080',
          400: '#505050',
          500: '#2A2A2A',
          600: '#1F1F1F',
          700: '#1A1A1A',
          800: '#111111',
          900: '#0A0A0A',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
