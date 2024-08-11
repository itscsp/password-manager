/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        saira: ["Saira", "sans-serif"],
        inter: ["Inter", "sans-serif"],

        // Add other font families if needed
      },
      colors: {
        black: "#000000", // Custom name for the color
        red: "#D71340",
        redHover: "rgb(138 10 39)",
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
        base: "16px", // or '1rem'
      },
    },
  },
  plugins: [],
};
