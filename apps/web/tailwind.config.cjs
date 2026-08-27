module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'fs-green': '#00E676',
        'dark-bg': '#0A0F1A',
        'card-bg': '#1A2332',
        'muted-text': '#94A3B8'
      },
      fontFamily: {
        ui: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    }
  },
  plugins: []
};
