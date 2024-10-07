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
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        // Custom light theme
        light: {
          primary: '#E2F1E7',
          secondary: '#387478',
          accent: '#8AB396',
          neutral: '#F7FAF9',
          'base-100': '#FFFFFF',
          info: '#3ABFF8',
          success: '#36D399',
          warning: '#FBBD23',
          error: '#F87272',
          font: '#2E3D3B',
        },
      },
      {
        // Custom dark theme
        dark: {
          primary: '#629584',
          secondary: '#243642',
          accent: '#88B0A3',
          neutral: '#393939',
          'base-100': '#1B2624',
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
