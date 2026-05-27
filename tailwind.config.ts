import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'Playfair Display', 'serif'],
        body:    ['var(--font-body)',    'DM Sans', 'sans-serif'],
      },
      colors: {
        // Sage green — primary palette
        sage: {
          50:  '#f6f9f4',
          100: '#eaf2e6',
          200: '#d3e6cc',
          300: '#aecfa4',
          400: '#7db870',
          500: '#5a9e4e',
          600: '#448039',
          700: '#376631',
          800: '#2e5228',
          900: '#264422',
          950: '#162915',
        },
        // Warm cream — background tones
        cream: {
          50:  '#fefdf8',
          100: '#fdf8ee',
          200: '#f9edd4',
          300: '#f3ddb0',
        },
        // Keep forest alias for backward compat
        forest: {
          50:  '#f6f9f4',
          100: '#eaf2e6',
          200: '#d3e6cc',
          300: '#aecfa4',
          400: '#7db870',
          500: '#5a9e4e',
          600: '#448039',
          700: '#376631',
          800: '#2e5228',
          900: '#264422',
          950: '#162915',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
