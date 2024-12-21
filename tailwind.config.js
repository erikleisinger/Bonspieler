/** @type {import('tailwindcss').Config} */
export default {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  content: [
    './src/**/*.{vue}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    {
      pattern: /bg-(.+)-(50|100|200|500)/,
      variants: ['hover'],
    },
    {
      pattern: /text-(.+)-(50|100|200|500)/,
      variants: ['hover'],
    },
  ],
}

