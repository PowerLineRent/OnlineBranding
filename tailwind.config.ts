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
          // ── Authorized digital brand colors ──────────────────────────
          navy:          '#000080', // Primary — all digital use
          'navy-hover':  '#0000aa', // Interactive hover
          'navy-dark':   '#00004d', // Dark backgrounds / pressed
          yellow:        '#F5C518', // Secondary — accents & highlights
          'yellow-hover':'#D4A800', // Yellow hover / pressed
          'yellow-light':'#FEF9E3', // Very light yellow tint

          // ── Logo source colors (from SVG files) ──────────────────────
          'logo-navy':   '#282973', // Actual navy in logo SVG paths
          'gold-dark':   '#F1BF24', // Lightning bolt gradient — dark end
          'gold-light':  '#FFD456', // Lightning bolt gradient — light end
          'gold-solid':  '#FFD555', // Letterhead bottom accent stripe

          // ── UI support ───────────────────────────────────────────────
          'bg-light':    '#E8ECFF', // Section backgrounds
          'bg-border':   '#D5DBF5', // Card / divider borders
          'text-body':   '#4A4A63', // Body copy

          // ── Status ───────────────────────────────────────────────────
          success:       '#2A7D2A',
          error:         '#A02A2A',
        },
      },
    },
  },
  plugins: [],
};

export default config;
