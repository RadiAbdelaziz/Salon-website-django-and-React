import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom salon colors with automatic text contrast
        'salon-cream': '#dbc5a6',
        'salon-gold': '#B89F67',
        'salon-black': '#000000',
        // Text colors for contrast
        'text-on-cream': '#221e1f',
        'text-on-gold': '#f6e8d4',
        'text-on-black': '#f6e8d4',
        // Extended salon color palette
        'glamour-gold': '#dbc5a6',
        'glamour-gold-light': '#DFB97B',
        'glamour-gold-dark': '#B99668',
        'golden-sandstone': '#8A724C',
        'silken-dune': '#DCC9A7',
        'champagne-veil': '#EDE2CC',
        'ivory-whisper': '#F7F3E8',
        'warm-brown': '#7B6557',
        'medium-beige': '#AD8871',
      },
      fontFamily: {
        'salon': ['Almarai', 'Cairo', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'salon-gold': '0 4px 6px -1px rgba(184, 159, 103, 0.1), 0 2px 4px -1px rgba(184, 159, 103, 0.06)',
        'salon-gold-lg': '0 10px 15px -3px rgba(184, 159, 103, 0.1), 0 4px 6px -2px rgba(184, 159, 103, 0.05)',
        'salon-gold-xl': '0 20px 25px -5px rgba(184, 159, 103, 0.1), 0 10px 10px -5px rgba(184, 159, 103, 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        slideUp: {
          'from': { 
            opacity: '0',
            transform: 'translateY(20px)',
          },
          'to': { 
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        bounceGentle: {
          '0%, 20%, 50%, 80%, 100%': {
            transform: 'translateY(0)',
          },
          '40%': {
            transform: 'translateY(-10px)',
          },
          '60%': {
            transform: 'translateY(-5px)',
          },
        },
      },
    },
  },
  plugins: [],
}

export default config
