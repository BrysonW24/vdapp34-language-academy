import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        /* Editorial accent palette */
        editorial: {
          green: "#386a58",
          "green-soft": "#e5f1ea",
          amber: "#a16a1f",
          "amber-soft": "#f7ecd6",
          red: "#a0453f",
          "red-soft": "#f7e5e2",
          blue: "#2f4f79",
          "blue-soft": "#e6eef8",
          paper: "#f7f3ea",
          "paper-strong": "#fffdf8",
          canvas: "#f1ece1",
          ink: "#1d2126",
          muted: "#65655f",
        },
      },
      borderRadius: {
        "xl": "22px",
        "lg": "16px",
        "md": "12px",
        "sm": "10px",
        "panel": "26px",
        "hero": "32px",
      },
      fontFamily: {
        serif: ['"Iowan Old Style"', '"Palatino Linotype"', '"Book Antiqua"', 'Georgia', 'serif'],
        sans: ['"Avenir Next"', '"Segoe UI"', '"Helvetica Neue"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SFMono-Regular"', 'Consolas', 'monospace'],
      },
      boxShadow: {
        "editorial": "0 24px 70px rgba(87, 73, 47, 0.12)",
        "editorial-soft": "0 10px 30px rgba(87, 73, 47, 0.08)",
        "editorial-hover": "0 18px 40px rgba(87, 73, 47, 0.14)",
      },
      keyframes: {
        "rise-in": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "rise-in": "rise-in 580ms cubic-bezier(0.2, 0.75, 0.2, 1) forwards",
      },
    },
  },
  plugins: [tailwindcssAnimate],
}

export default config
