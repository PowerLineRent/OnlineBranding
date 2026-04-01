import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        plrei: {
          navy: '#000080',
          'navy-hover': '#0000aa',
          'navy-dark': '#00004d',
          'bg-light': '#e8ecff',
          'bg-border': '#d5dbf5',
          'text-body': '#4a4a63',
          success: '#2a7d2a',
          error: '#a02a2a',
        },
      },
    },
  },
  plugins: [],
};

export default config;
