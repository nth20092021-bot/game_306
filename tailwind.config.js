/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        chrono: {
          gold: '#d4af37',
          amber: '#f59e0b',
          glow: '#ffdf80',
          cyan: '#38bdf8',
          deep: '#070a13',
          dark: '#0c101c',
          card: '#111728'
        }
      },
      fontFamily: {
        serif: ['"Lora"', '"Be Vietnam Pro"', 'Georgia', 'serif'],
        sans: ['"Be Vietnam Pro"', 'system-ui', '-apple-system', 'sans-serif'],
        roman: ['"Cinzel"', '"Lora"', 'serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 20s linear infinite',
      }
    },
  },
  plugins: [],
}
