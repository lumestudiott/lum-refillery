import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'refill-ink': '#2B2B2B',
        'refill-yellow': '#F5D547',
        'refill-peach': '#F5C3A0',
        'refill-green': '#A8D5A2',
        'refill-tan': '#E8D5B7',
        'refill-blue': '#B5D4E8',
        cream: {
          50: '#FFF9ED',
          100: '#FFF3DB',
          200: '#FFE8B8',
        },
        forest: {
          800: '#2D5A27',
        },
      },
      fontFamily: {
        display: [
          '"DM Serif Display"',
          'Georgia',
          'serif',
        ],
      },
      boxShadow: {
        'soft-float': '0 4px 24px rgba(0, 0, 0, 0.08)',
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
    },
  },
  plugins: [],
};

export default config;
