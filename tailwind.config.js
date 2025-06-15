/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./client/**/*.{html,js,ejs}",  // ✅ Adjust this to match your file types
    "./views/**/*.{html,js,ejs}",   // if you're using EJS with Express
    "./public/**/*.{html,js}",      // optional, if HTML files are in public
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
