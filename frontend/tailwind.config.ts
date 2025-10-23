import type { Config } from 'tailwindcss'

// For Tailwind v4 with Next.js, this file just needs to point to your content.
// All theme customizations now live in `app/globals.css`.
const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
plugins: [
  require('tailwind-scrollbar'),
],

}
export default config

