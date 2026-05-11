import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* ── Starbucks-inspired four-tier green system ── */
        'lume-green': '#006241',       // Brand heading green (Starbucks Green)
        'lume-accent': '#00754A',      // Primary CTA fill (Green Accent)
        'lume-house': '#1E3932',       // Deep band / footer (House Green)
        'lume-uplift': '#2b5148',      // Decorative mid-dark accent

        /* ── Legacy tokens kept for non-hero sections ── */
        'refill-ink': '#2B2B2B',
        'refill-yellow': '#F5D547',
        'refill-peach': '#F5C3A0',
        'refill-green': '#A8D5A2',
        'refill-tan': '#E8D5B7',
        'refill-blue': '#B5D4E8',
        'refill-lime': '#D4E9A2',
        'refill-pink': '#E8829B',

        /* ── Warm-neutral canvas system ── */
        canvas: {
          DEFAULT: '#f2f0eb',   // Primary page canvas (Neutral Warm)
          light: '#f9f9f9',     // Subtle cool-gray utility
        },
        ceramic: '#edebe9',     // Zone separator cream

        cream: {
          50: '#FFF9ED',
          100: '#FFF3DB',
          200: '#FFE8B8',
        },

        forest: {
          800: '#2D5A27',
        },

        /* ── Accent ── */
        gold: '#cba258',
        'gold-light': '#dfc49d',

        /* ── Semantic ── */
        copper: {
          600: '#c82014',
        },

        /* ── Text system ── */
        'text-primary': 'rgba(0, 0, 0, 0.87)',
        'text-secondary': 'rgba(0, 0, 0, 0.58)',
      },

      fontFamily: {
        display: [
          '"DM Serif Display"',
          '"Iowan Old Style"',
          'Georgia',
          'serif',
        ],
        sans: [
          'Inter',
          '"Helvetica Neue"',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },

      borderRadius: {
        'pill': '50px',
        'card': '12px',
      },

      boxShadow: {
        'soft-float': '0 4px 24px rgba(0, 0, 0, 0.08)',
        'card': '0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24)',
        'nav': '0 1px 3px rgba(0,0,0,0.1), 0 2px 2px rgba(0,0,0,0.06), 0 0 2px rgba(0,0,0,0.07)',
        'frap': '0 0 6px rgba(0,0,0,0.24), 0 8px 12px rgba(0,0,0,0.14)',
      },

      letterSpacing: {
        tightest: '-0.04em',
        tight: '-0.01em',
        snug: '-0.16px',
      },

      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
