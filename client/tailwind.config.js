/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4f46e5",
          hover: "#4338ca",
        },
        secondary: "#64748b",
        background: "#0f172a",
        surface: "#1e293b",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
