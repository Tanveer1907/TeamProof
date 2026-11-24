/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7654DC',
          hover: '#6543C5',
          light: '#F0EAFF',
          dark: '#5836C4',
        },
        surface: {
          page: '#F7F8FC',
          card: '#FFFFFF',
          border: '#E1E4EC',
          // Dark Mode Tokens
          'dark-page': '#0E1117',
          'dark-card': '#161B22',
          'dark-border': '#30363D',
          'dark-subtle': '#21262D',
        },
        content: {
          primary: '#242438',
          secondary: '#62677A',
          muted: '#8E94A5',
          // Dark Mode Text
          'dark-primary': '#F0F6FC',
          'dark-secondary': '#8B949E',
          'dark-muted': '#6E7681',
        },
        status: {
          success: '#16865C',
          'success-bg': '#E8F5E9',
          warning: '#D98B28',
          'warning-bg': '#FFF8E1',
          danger: '#D94B4B',
          'danger-bg': '#FFEBEE',
          info: '#3677C7',
          'info-bg': '#E3F2FD',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        card: '0 2px 4px rgba(0, 0, 0, 0.02), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'dark-card': '0 2px 4px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
}
