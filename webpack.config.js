const path = require("path");

module.exports = {
  entry: "./src/vanilla.tsx", // Vstupní bod
  output: {
    filename: "passprove-widget.js", // Výstupní soubor
    path: path.resolve(__dirname, "dist"), // Výstupní složka
    library: "PassProve", // Globální objekt pro vanilla.js
    libraryTarget: "umd", // Univerzální formát
    globalObject: "this", // Kompatibilita s Node.js a browserem
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx"], // Podporované přípony
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/, // Zpracování TypeScript souborů
        use: [
          {
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                noEmit: false,
              },
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/, // Zpracování CSS souborů
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
    ],
  },
  // Zabalíme React a ReactDOM přímo do výsledného balíčku
  externals: {
    // ŽÁDNÉ externals - vše bude zabaleno přímo v bundle
  },
  mode: "production", // Produkční režim
};