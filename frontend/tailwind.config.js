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
            light: '#FAF6F0',
            dark: '#120F0D',
          },
          sidebar: {
            DEFAULT: '#1A1412',
            border: '#2A201C',
            active: '#2D1E18',
            activeText: '#F39C74',
            activeBorder: '#523326',
            hover: '#251D18',
          },
          card: {
            light: '#FFFFFF',
            dark: '#1A1513',
          },
          peach: {
            bg: '#FBF0E6',
            darkBg: '#2A1C16',
            border: '#F5D2BF',
            darkBorder: '#4C2D20',
            badge: '#F6D5C2',
          },
          subtle: {
            light: '#F3ECE4',
            dark: '#221B17',
          },
          border: {
            light: '#EDE5DC',
            dark: '#2A211D',
          },
          terracotta: {
            DEFAULT: '#C85A32',
            hover: '#B34A24',
            light: '#E07A5F',
            soft: '#FBF0E6',
          },
          text: {
            main: '#1E1611',
            darkMain: '#F5EFE8',
            muted: '#756557',
            darkMuted: '#B5A599',
            light: '#A6988B',
          }
        },
        studio: {
          bg: {
            light: '#FAF6F0',
            dark: '#120F0D',
          },
          card: {
            light: '#FFFFFF',
            dark: '#1A1513',
          },
          subtle: {
            light: '#F3ECE4',
            dark: '#221B17',
          },
          border: {
            light: '#EDE5DC',
            dark: '#2A211D',
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
