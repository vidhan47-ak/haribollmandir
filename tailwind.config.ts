import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm cream backgrounds
        cream: {
          DEFAULT: "#FAF4EA",
          50: "#FEFBF5",
          100: "#FAF4EA",
          200: "#F3E8D5",
          300: "#EBDABE",
        },
        // Temple gold
        gold: {
          DEFAULT: "#C9A24B",
          light: "#E3C77E",
          soft: "#D9BB70",
          deep: "#A8842F",
          deeper: "#8A5A1F",
        },
        // Devotional maroon
        maroon: {
          DEFAULT: "#6E1E2A",
          light: "#8A2C3A",
          dark: "#4A1219",
        },
        // Deep temple green
        forest: {
          DEFAULT: "#234437",
          light: "#356150",
          dark: "#152B22",
        },
        // Soft devotional blue
        sky: {
          DEFAULT: "#9BB8C9",
          light: "#C4D8E2",
          deep: "#6E97AC",
        },
        // Warm ink for text
        ink: {
          DEFAULT: "#3A2E26",
          soft: "#6B5A4E",
          muted: "#9A8A7C",
        },
        // Deep teal-green (illuminated-manuscript text on parchment)
        teal: {
          DEFAULT: "#1C4A45",
          dark: "#123531",
          deep: "#0E2825",
          light: "#2E6A63",
        },
        // Iridescent peacock blue-green
        peacock: {
          DEFAULT: "#146B7C",
          dark: "#0C4A57",
          light: "#2E92A6",
        },
        // Soft pink florals
        rose: {
          DEFAULT: "#E7A3B0",
          light: "#F4CCD4",
          deep: "#C87E8E",
        },
      },
      fontFamily: {
        heading: ["var(--font-playfair)", "Georgia", "serif"],
        display: ["var(--font-cinzel)", "Georgia", "serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        script: ["var(--font-handlee)", "cursive"],
      },
      backgroundImage: {
        "gold-gradient":
          "linear-gradient(135deg, #E3C77E 0%, #C9A24B 45%, #A8842F 100%)",
        "cream-radial":
          "radial-gradient(1200px circle at 50% 0%, #FEFBF5 0%, #FAF4EA 45%, #F3E8D5 100%)",
        "maroon-gradient":
          "linear-gradient(135deg, #6E1E2A 0%, #4A1219 100%)",
        "hero-overlay":
          "linear-gradient(180deg, rgba(20,10,8,0.55) 0%, rgba(30,15,12,0.35) 40%, rgba(20,10,8,0.75) 100%)",
        // Warm golden-hour base for the redesigned hero
        "hero-warm":
          "linear-gradient(180deg,#F4E6C4 0%,#EDD199 40%,#D8AF66 74%,#BC8E48 100%)",
        // Cream parchment fill for the arch panel
        parchment:
          "linear-gradient(180deg,#FCF6EA 0%,#F6EAD1 55%,#EEDFBE 100%)",
      },
      boxShadow: {
        soft: "0 10px 40px -15px rgba(58,46,38,0.25)",
        card: "0 20px 50px -20px rgba(74,18,25,0.28)",
        glow: "0 0 60px -10px rgba(227,199,126,0.55)",
        "gold-ring": "0 0 0 1px rgba(201,162,75,0.35)",
        // Frosted glass pill depth
        glass:
          "inset 0 1px 0 rgba(255,255,255,0.45),inset 0 -10px 26px rgba(0,0,0,0.10),0 14px 34px -14px rgba(0,0,0,0.45)",
        // Ornate arch panel lift
        arch: "0 30px 80px -30px rgba(74,18,25,0.35)",
      },
      letterSpacing: {
        widest2: "0.28em",
      },
      keyframes: {
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
      },
      animation: {
        "float-slow": "float-slow 7s ease-in-out infinite",
        shimmer: "shimmer 6s linear infinite",
      },
      transitionTimingFunction: {
        devotional: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
