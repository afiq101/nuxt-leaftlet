/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["/app.vue"],
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light", "dark", "cupcake"],
  },
};
