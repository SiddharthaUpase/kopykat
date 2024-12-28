import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        linkedin: {
          blue: '#0A66C2',
          black: '#000000',
          gray: {
            50: '#F3F2EF',
            100: '#DCDBDA',
            200: '#939292',
            300: '#666666',
            400: '#4C4C4C',
          }
        }
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px #000000',
        'brutal-hover': '2px 2px 0px 0px #000000',
      }
    },
  },
  plugins: [],
} satisfies Config;
