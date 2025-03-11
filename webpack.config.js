const path = require("path");

module.exports = {
  entry: "./src/PassProveWidget.tsx", // Uprav dle umístění hlavního souboru
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
  },
  mode: "production",
};
