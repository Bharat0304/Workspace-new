/** @type {import('tailwindcss').Config} */
module.exports = {
  // Extend shared Tailwind config from @repo/tailwind-config
  presets: [require('@repo/tailwind-config')],
  content: ['./src/**/*.{js,ts,jsx,tsx,html}'],
  // Preserve prefix used in CSS import
  prefix: 'ui-',
};
