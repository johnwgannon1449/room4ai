/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1A7A55',
        accent: '#F59E0B',
        'progress-green': '#22C55E',
        background: '#F0F7F4',
        'text-main': '#1A2E25',
        label: '#5A7D6E',
        border: '#D4E8DF',
        'card-bg': '#FFFFFF',
        'primary-dark': '#15634A',
        'primary-light': '#E8F5EF',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 4px rgba(26,122,85,0.07), 0 1px 2px rgba(26,122,85,0.04)',
        'card-hover': '0 4px 12px rgba(26,122,85,0.12), 0 2px 4px rgba(26,122,85,0.06)',
      },
    },
  },
  plugins: [],
};
