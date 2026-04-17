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
          'bg-light': '#FFFFFF',
          'bg-border': '#3F4042',
          'text-body': '#4A4A4B',
        },
      },
    },
  },
  plugins: [],
};

export default config;
