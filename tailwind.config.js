const config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#08080f",
          card: "#0e0e1c",
          hover: "#13132a",
          border: "#1e1e38",
        },
        brand: {
          green: "#00d4aa",
          red: "#ff4d6d",
          blue: "#4d9fff",
          gold: "#f0c040",
          muted: "#5a5a8a",
        },
      },
      fontFamily: {
        mono: ["var(--font-jetbrains)", "monospace"],
        display: ["var(--font-syne)", "sans-serif"],
      },
      animation: {
        ticker: "ticker 50s linear infinite",
        "slide-up": "slideUp 0.4s ease forwards",
        "fade-in": "fadeIn 0.3s ease forwards",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
      },
      keyframes: {
        ticker: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
