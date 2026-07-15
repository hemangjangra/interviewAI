/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Brand colors
        brand: {
          50: 'hsl(221, 100%, 97%)',
          100: 'hsl(221, 100%, 93%)',
          200: 'hsl(221, 96%, 87%)',
          300: 'hsl(221, 91%, 77%)',
          400: 'hsl(221, 87%, 67%)',
          500: 'hsl(221, 83%, 57%)',
          600: 'hsl(221, 78%, 49%)',
          700: 'hsl(221, 74%, 41%)',
          800: 'hsl(221, 67%, 34%)',
          900: 'hsl(221, 61%, 28%)',
          950: 'hsl(221, 57%, 18%)',
        },
        success: {
          DEFAULT: 'hsl(142, 76%, 36%)',
          foreground: 'hsl(0, 0%, 100%)',
          muted: 'hsl(142, 76%, 95%)',
        },
        warning: {
          DEFAULT: 'hsl(38, 92%, 50%)',
          foreground: 'hsl(0, 0%, 100%)',
          muted: 'hsl(38, 92%, 96%)',
        },
        info: {
          DEFAULT: 'hsl(199, 89%, 48%)',
          foreground: 'hsl(0, 0%, 100%)',
          muted: 'hsl(199, 89%, 95%)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-out': {
          from: { opacity: '1', transform: 'translateY(0)' },
          to: { opacity: '0', transform: 'translateY(8px)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'count-up': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-out': 'fade-out 0.2s ease-in',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'pulse-ring': 'pulse-ring 1.5s ease-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
      backgroundImage: {
        shimmer:
          'linear-gradient(90deg, transparent 25%, hsl(var(--muted)) 50%, transparent 75%)',
        'gradient-brand':
          'linear-gradient(135deg, hsl(221, 83%, 57%) 0%, hsl(258, 90%, 66%) 100%)',
        'gradient-success':
          'linear-gradient(135deg, hsl(142, 76%, 36%) 0%, hsl(167, 65%, 43%) 100%)',
      },
      boxShadow: {
        'glow-brand':
          '0 0 20px -5px hsl(221, 83%, 57% / 0.4), 0 4px 12px -2px hsl(0, 0%, 0% / 0.1)',
        'card-hover':
          '0 8px 30px -12px hsl(0, 0%, 0% / 0.15), 0 4px 12px -6px hsl(0, 0%, 0% / 0.1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
