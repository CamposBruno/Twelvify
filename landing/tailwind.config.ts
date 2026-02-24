import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#f56060',
        'background-light': '#f8f6f6',
        'background-dark': '#221010',
      },
      fontFamily: {
        display: ["'Permanent Marker'", 'cursive'],
        punk: ["'Special Elite'", 'monospace'],
        body: ["'Inter'", 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0px',
        lg: '0px',
        xl: '0px',
        full: '9999px',
      },
    },
  },
  plugins: [],
}

export default config
