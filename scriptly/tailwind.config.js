// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Adjust this path if your files are in a different directory
  ],
  theme: {
    extend: {},
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.word-spacing-1': {
          wordSpacing: '0.25rem', // 4px spacing
        },
        '.word-spacing-2': {
          wordSpacing: '0.5rem',  // 8px spacing
        },
        '.word-spacing-3': {
          wordSpacing: '1rem',    // 16px spacing
        },
        '.word-spacing-4': {
          wordSpacing: '2rem',    // 32px spacing
        },
      };

      addUtilities(newUtilities, ['responsive', 'hover']); // Make them available for responsive and hover states
    },
  ],
};
