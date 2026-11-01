export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#06060a',
          900: '#09090f',
          850: '#0c0c14',
          800: '#11111c',
          700: '#181827',
          600: '#222236',
        },
        accent: {
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
        electric: '#6366f1',
      },
      fontFamily: {
        sans: [
          'Inter Variable',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono Variable',
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
      },
      boxShadow: {
        glow: '0 0 60px -16px rgba(139, 92, 246, 0.7)',
        'glow-sm': '0 0 32px -12px rgba(139, 92, 246, 0.65)',
        card: '0 24px 80px -32px rgba(0, 0, 0, 0.85)',
        'inner-line': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      },
      backgroundImage: {
        'accent-gradient':
          'linear-gradient(120deg, #a78bfa 0%, #818cf8 45%, #38bdf8 100%)',
        'panel-gradient':
          'linear-gradient(180deg, rgba(17,17,28,0.92) 0%, rgba(9,9,15,0.96) 100%)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-down': {
          from: { opacity: '0', transform: 'translateY(-6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        aurora: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '50%': { transform: 'translate3d(40px, -30px, 0) scale(1.12)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        blink: {
          '0%, 45%': { opacity: '1' },
          '50%, 95%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'typing-bounce': {
          '0%, 60%, 100%': { transform: 'translateY(0)', opacity: '0.45' },
          '30%': { transform: 'translateY(-4px)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.45s ease-out both',
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'scale-in': 'scale-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
        'slide-down': 'slide-down 0.28s cubic-bezier(0.22, 1, 0.36, 1) both',
        aurora: 'aurora 16s ease-in-out infinite',
        float: 'float 7s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3.5s ease-in-out infinite',
        blink: 'blink 1.05s step-end infinite',
        'typing-bounce': 'typing-bounce 1.2s ease-in-out infinite',
        shimmer: 'shimmer 2.4s linear infinite',
      },
    },
  },
  plugins: [],
}
