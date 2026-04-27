import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:  ['var(--font-dm-sans)',  'system-ui', 'sans-serif'],
        serif: ['var(--font-lora)',     'Georgia',   'serif'],
      },
    },
  },
  plugins: [],
}

export default config
