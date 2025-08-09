/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {  colors: {
      'custom-blue': '#0A2A57',
    },},
  },
  plugins: [],
  safelist: ['direction-rtl'],
}
