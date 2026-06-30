/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#EBF5FB', 100: '#D6EAF8', 500: '#2E86AB',
          600: '#2471A3', 700: '#1E6091', 900: '#1E3A5F',
        },
        accent:  { 500: '#17A589', 600: '#148F77' },
        warning: { 500: '#E67E22', 600: '#CA6F1E' },
        danger:  { 500: '#C0392B', 600: '#A93226' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
