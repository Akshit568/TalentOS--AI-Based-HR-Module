/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Semantic surface tokens backed by CSS vars
        base:    'var(--c-base)',
        surface: 'var(--c-surface)',
        raised:  'var(--c-raised)',
        border:  'var(--c-border)',
        'border-strong': 'var(--c-border-strong)',
        tx1:     'var(--c-tx1)',
        tx2:     'var(--c-tx2)',
        tx3:     'var(--c-tx3)',
        tx4:     'var(--c-tx4)',
      },
    },
  },
  plugins: [],
};
