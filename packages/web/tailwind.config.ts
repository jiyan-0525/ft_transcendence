import type { Config } from 'tailwindcss'

// Design tokens are added in A1. Content paths are final from the start so
// classes are never purged during the bootstrap phase.
export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
