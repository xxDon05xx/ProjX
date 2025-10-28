/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./signup.html", "./signup.js"], // adjust paths to your project
  theme: {
    extend: {
      keyframes: {
        floatDiamond: {
          "0%": { transform: "rotate(45deg) translateY(0)", opacity: "0.5" },
          "50%": { transform: "rotate(45deg) translateY(-40px)", opacity: "0.7" },
          "100%": { transform: "rotate(45deg) translateY(0)", opacity: "0.5" },
        },
      },
      animation: {
        floatDiamond: "floatDiamond 10s infinite linear",
      },
    },
  },
  plugins: [],
};
