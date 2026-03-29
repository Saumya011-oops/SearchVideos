/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        charcoal: '#1a1a2e',
        amber: {
          DEFAULT: '#e2b340',
          light: '#f0c96a',
          dark: '#c49a2a',
        },
        teal: {
          DEFAULT: '#2d6a6a',
          light: '#3d8a8a',
          dark: '#1e4a4a',
        },
        cream: {
          DEFAULT: '#f5f0e8',
          dark: '#ebe4d5',
        },
        coral: {
          DEFAULT: '#d4603a',
          light: '#e07a56',
          dark: '#b84e2a',
        },
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
        md: '10px',
        lg: '12px',
      },
      boxShadow: {
        warm: '0 4px 24px rgba(226, 179, 64, 0.10)',
        'warm-md': '0 8px 32px rgba(226, 179, 64, 0.15)',
        'warm-lg': '0 16px 48px rgba(226, 179, 64, 0.20)',
      },
    },
  },
  plugins: [],
}
