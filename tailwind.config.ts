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
          yellow: '#F5C518',
          'bg-light': '#E8ECFF',
          'bg-border': '#D5DBF5',
          'text-body': '#4A4A63',
        },
      },
    },
  },
  plugins: [],
};

export default config;
