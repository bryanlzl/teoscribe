/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },
      fontFamily: { sans: ['noto-sans', 'sans-serif'] },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(0.75rem)' },
        },
      },
      animation: {
        'float-up-down': 'float 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        // Custom light theme
        light: {
          primary: '#E2F1E7',
          secondary: '#94d3c1',
          secondaryDark: '#75b3a4',
          accent: '#8AB396',
          neutral: '#F7FAF9',
          'base-100': '#FFFFFF',
          info: '#3ABFF8',
          success: '#36D399',
          warning: '#FBBD23',
          error: '#F87272',
          font: '#3D5453',
        },
      },
      {
        // Custom dark theme
        dark: {
          primary: '#4E7C6A',
          secondary: '#334E5E',
          secondaryDark: '#243642',
          accent: '#88B0A3',
          neutral: '#393939',
          'base-100': '#304341',
          info: '#3ABFF8',
          success: '#36D399',
          warning: '#FBBD23',
          error: '#F87272',
          font: '#DCE7E4',
        },
      },
    ],
  },
};
