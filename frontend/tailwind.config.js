/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['Fraunces', 'Newsreader', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      colors: {
        vinculo: {
          bg: {
            light: '#F1F3F5',
            dark: '#111418',
          },
          sidebar: {
            DEFAULT: '#121519',
            border: '#C85A32',
            active: '#1A1F26',
            activeText: '#F39C74',
            activeBorder: '#C85A32',
            hover: '#181C22',
          },
          card: {
            light: '#F8F9FA',
            dark: '#181C21',
          },
          silver: {
            50: '#FAFBFD',
            100: '#F4F5F8',
            200: '#E9ECEF',
            300: '#DEE2E6',
            400: '#CED4DA',
            500: '#ADB5BD',
            600: '#6C757D',
            700: '#495057',
            800: '#343A40',
            900: '#212529',
          },
          contour: {
            DEFAULT: '#C85A32',
            light: '#D97757',
            soft: '#EAA085',
            muted: 'rgba(200, 90, 50, 0.35)',
            bronze: '#9A4C2E',
            copper: '#B85D3B',
          },
          border: {
            light: '#E2E6EA',
            dark: '#262D35',
            contour: '#C85A32',
          },
          terracotta: {
            DEFAULT: '#C85A32',
            hover: '#B34A24',
            light: '#E07A5F',
            soft: '#F4F5F8',
          },
          text: {
            main: '#1A1E24',
            darkMain: '#F1F3F5',
            muted: '#6C757D',
            darkMuted: '#ADB5BD',
            light: '#868E96',
          }
        },
        studio: {
          bg: {
            light: '#F1F3F5',
            dark: '#111418',
          },
          card: {
            light: '#F8F9FA',
            dark: '#181C21',
          },
          subtle: {
            light: '#E9ECEF',
            dark: '#1E232A',
          },
          border: {
            light: '#E2E6EA',
            dark: '#262D35',
          },
        },
        terracotta: {
          50: '#fdf6f0',
          100: '#fbf0e6',
          200: '#f6d5c2',
          300: '#f0b59b',
          400: '#e58e6e',
          500: '#c85a32',
          600: '#b34a24',
          700: '#943b1c',
          800: '#783119',
          900: '#632b17',
        },
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(30, 22, 17, 0.03)',
        'panel': '0 1px 3px 0 rgba(30, 22, 17, 0.04), 0 1px 2px -1px rgba(30, 22, 17, 0.03)',
        'dropdown': '0 10px 25px -5px rgba(30, 22, 17, 0.08), 0 8px 10px -6px rgba(30, 22, 17, 0.04)',
        'modal': '0 25px 50px -12px rgba(30, 22, 17, 0.25)',
      },
      borderRadius: {
        'std': '0.75rem',
      },
    },
  },
  plugins: [],
}
