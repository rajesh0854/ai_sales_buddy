/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef2ff", 100: "#e0e7ff", 200: "#c7d2fe", 300: "#a5b4fc",
          400: "#818cf8", 500: "#6366f1", 600: "#4f46e5", 700: "#4338ca",
          800: "#3730a3", 900: "#312e81",
        },
        accent: {
          50: "#ecfdf5", 100: "#d1fae5", 400: "#34d399", 500: "#10b981", 600: "#059669",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 8px -2px rgba(16,24,40,0.06), 0 4px 20px -4px rgba(16,24,40,0.08)",
        card: "0 1px 3px rgba(16,24,40,0.04), 0 8px 30px -8px rgba(16,24,40,0.10)",
        glow: "0 0 0 1px rgba(99,102,241,0.15), 0 8px 40px -8px rgba(99,102,241,0.35)",
      },
      backgroundImage: {
        "grid-slate": "linear-gradient(to right, rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.04) 1px, transparent 1px)",
      },
      keyframes: {
        "fade-up": { "0%": { opacity: 0, transform: "translateY(12px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
        "gradient-pan": { "0%": { backgroundPosition: "0% 50%" }, "100%": { backgroundPosition: "200% 50%" } },
        "blob-float": {
          "0%,100%": { transform: "translate(0,0) scale(1)" },
          "33%": { transform: "translate(4%,-6%) scale(1.08)" },
          "66%": { transform: "translate(-3%,4%) scale(0.95)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        float: "float 6s ease-in-out infinite",
        "gradient-pan": "gradient-pan 3s linear infinite",
        "blob-float": "blob-float 14s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
