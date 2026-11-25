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
        brand: {
          DEFAULT: '#15966A',
          hover: '#117A55',
          active: '#0D6848',
          dark: '#153B2D',
          light: '#D8F0E3',
          subtle: '#EAF6EE',
          gold: '#D69E36',
          // Dark overrides
          'dark-primary': '#35B982',
          'dark-hover': '#4AC993',
          'dark-active': '#249B6A',
          'dark-light': '#214B36',
          'dark-subtle': '#1B3829',
          'dark-text': '#B4EBD0',
          'dark-gold': '#E7B95D',
        },
        primary: {
          DEFAULT: '#15966A',
          hover: '#117A55',
          active: '#0D6848',
          light: '#D8F0E3',
          subtle: '#EAF6EE',
          dark: '#153B2D',
          // Dark mode equivalents
          'dark-default': '#35B982',
          'dark-hover': '#4AC993',
          'dark-active': '#249B6A',
          'dark-light': '#214B36',
          'dark-subtle': '#1B3829',
          'dark-text': '#B4EBD0',
        },
        surface: {
          page: '#F7FAF8',
          card: '#FFFFFF',
          secondary: '#F2F8F4',
          tertiary: '#EAF2EC',
          border: '#DFE9E1',
          'border-strong': '#C6D6CA',
          // Dark Mode Tokens (Refined Charcoal + Emerald Accent)
          'dark-page': '#111416',
          'dark-sidebar': '#171C1E',
          'dark-card': '#1B2022',
          'dark-secondary': '#22292B',
          'dark-tertiary': '#2A3234',
          'dark-border': '#30383A',
          'dark-border-strong': '#414B4D',
        },
        content: {
          primary: '#172B21',
          secondary: '#52665A',
          muted: '#84948A',
          // Dark Mode Text
          'dark-primary': '#F1F5F3',
          'dark-secondary': '#A5AFAB',
          'dark-muted': '#858F8C',
        },
        status: {
          success: '#15966A',
          'success-bg': '#EAF6EE',
          warning: '#D69E36',
          'warning-bg': '#FEF7EC',
          danger: '#DC5555',
          'danger-bg': '#FDF2F2',
          info: '#3985CF',
          'info-bg': '#EEF6FD',
          // Dark Mode Status
          'dark-success': '#35B982',
          'dark-success-bg': '#1B3829',
          'dark-warning': '#E7B95D',
          'dark-warning-bg': '#332714',
          'dark-danger': '#F07878',
          'dark-danger-bg': '#381B1B',
          'dark-info': '#71B2EC',
          'dark-info-bg': '#152C3F',
        },
        chart: {
          emerald: '#15966A',
          blue: '#3985CF',
          amber: '#D69E36',
          purple: '#8B70CF',
          red: '#DC5555',
          'dark-emerald': '#35B982',
          'dark-blue': '#71B2EC',
          'dark-amber': '#E7B95D',
          'dark-purple': '#A68EF2',
          'dark-red': '#F07878',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(23, 43, 33, 0.05), 0 1px 2px -1px rgba(23, 43, 33, 0.05)',
        card: '0 2px 4px rgba(23, 43, 33, 0.03), 0 1px 2px rgba(23, 43, 33, 0.04)',
        'dark-card': '0 2px 4px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
}
