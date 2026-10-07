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
        sans: ['Archivo', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        heading: ['Archivo', 'sans-serif'],
        mono: ['IBM Plex Mono', 'Menlo', 'monospace'],
      },
      colors: {
        paper: {
          DEFAULT: '#F4F4F6',
          dark: '#18191D',
        },
        ink: {
          DEFAULT: '#18191D',
          dark: '#F4F4F6',
        },
        signal: {
          DEFAULT: '#E54833',
          hover: '#C73524',
          pressed: '#C73524',
          soft: 'rgba(229, 72, 51, 0.12)',
        },
        rail: {
          DEFAULT: '#18191D',
          border: '#292A30',
          item: '#292A30',
          hover: '#33343A',
          active: '#292A30',
          subtle: '#44454B',
          muted: '#55565C',
        },
        swiss: {
          border: {
            50: '#F8F8FA',
            100: '#EEEEF1',
            200: '#E9E9ED',
            300: '#E2E2E8',
            400: '#D7D7DD',
            500: '#DEDEE3',
            600: '#D6D6DC',
            700: '#C6C7CD',
            800: '#BFC0C7',
          },
          text: {
            primary: '#18191D',
            secondary: '#686971',
            muted: '#71727A',
            subtle: '#777881',
            caption: '#74757C',
            light: '#676870',
            dark: '#4E4F57',
          },
          pill: {
            100: '#F8F8FA',
            200: '#EEEEF1',
            300: '#E9E9ED',
          }
        },
        enlace: {
          bg: {
            light: '#F4F4F6',
            dark: '#18191D',
          },
          sidebar: {
            DEFAULT: '#18191D',
            border: '#292A30',
            active: '#292A30',
            activeText: '#F4F4F6',
            activeBorder: '#E54833',
            hover: '#33343A',
          },
          card: {
            light: '#FFFFFF',
            dark: '#202126',
          },
          signal: {
            DEFAULT: '#E54833',
            pressed: '#C73524',
          },
          border: {
            light: '#E2E2E8',
            dark: '#292A30',
          },
          text: {
            main: '#18191D',
            darkMain: '#F4F4F6',
            muted: '#686971',
            darkMuted: '#BFC0C7',
          }
        },
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(24, 25, 29, 0.04)',
        'panel': '0 1px 3px 0 rgba(24, 25, 29, 0.06), 0 1px 2px -1px rgba(24, 25, 29, 0.04)',
        'dropdown': '0 10px 25px -5px rgba(24, 25, 29, 0.1), 0 8px 10px -6px rgba(24, 25, 29, 0.06)',
        'modal': '0 25px 50px -12px rgba(24, 25, 29, 0.25)',
      },
      borderRadius: {
        'std': '0.75rem',
      },
    },
  },
  plugins: [],
}
