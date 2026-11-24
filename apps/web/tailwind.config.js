/** @type {import('tailwindcss').Config} */
export default {
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
        },
        surface: {
          page: '#F7F8FC',
          card: '#FFFFFF',
          border: '#E1E4EC',
        },
        content: {
          primary: '#242438',
          secondary: '#62677A',
          muted: '#8E94A5',
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
      }
    },
  },
  plugins: [],
}
