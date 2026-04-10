/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#f0f0ff',
          100: '#e0e1ff',
          200: '#c7c8ff',
          300: '#a5a7fc',
          400: '#8b84f8',
          500: '#7c6cf3',
          600: '#6d51e8',
          700: '#5e3fcd',
          800: '#4d35a5',
          900: '#412f82',
        },
        dark: {
          900: '#0a0a14',
          800: '#0f0f1a',
          700: '#151525',
          600: '#1a1a30',
          500: '#202040',
          400: '#2a2a50',
          300: '#3a3a65',
        }
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0f0f1a 0%, #151525 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(79,70,229,0.1) 0%, rgba(168,85,247,0.1) 100%)',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(124, 108, 243, 0.3)',
        'glow': '0 0 20px rgba(124, 108, 243, 0.4)',
        'glow-lg': '0 0 40px rgba(124, 108, 243, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'bounce-dot': 'bounceDot 1.4s infinite ease-in-out',
      },
      keyframes: {
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceDot: {
          '0%, 80%, 100%': { transform: 'scale(0)', opacity: '0.3' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
