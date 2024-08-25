/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        growShrink: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
        },
      },
      animation: {
        growShrink: "growShrink 1s ease-in-out infinite",
      },

      fontFamily: {
        saira: ["Saira", "sans-serif"],
        inter: ["Inter", "sans-serif"],

        // Add other font families if needed
      },
      colors: {
        black: "#000000", // Custom name for the color
        opred: "#D71340",
        opredHover: "rgb(138 10 39)",
        opblack400: "#121212",
      },
      container: {
        center: true, // Center the container by default
        padding: "2rem", // Default padding for the container
        screens: {
          sm: "100%",
          md: "728px",
          lg: "728px",
          xl: "728px",
        },
      },
      fontSize: {
        base: "1rem", // or '1rem'
      },
    },
  },
  plugins: [],
};
