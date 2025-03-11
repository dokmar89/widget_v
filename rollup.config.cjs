const resolve = require("@rollup/plugin-node-resolve")
const commonjs = require("@rollup/plugin-commonjs")
const typescript = require("@rollup/plugin-typescript")
const { babel } = require("@rollup/plugin-babel")
const { terser } = require("rollup-plugin-terser")
const peerDepsExternal = require("rollup-plugin-peer-deps-external")
const postcss = require("rollup-plugin-postcss")
const dts = require("rollup-plugin-dts").default;
const packageJson = require("./package.json")

const extensions = ['.js', '.jsx', '.ts', '.tsx']

module.exports = [
  {
    input: "src/index.ts",
    output: [
      {
        file: packageJson.main,
        format: "cjs",
        sourcemap: true,
        exports: "named",
      },
      {
        file: packageJson.module,
        format: "esm",
        sourcemap: true,
        exports: "named",
      },
    ],
    plugins: [
      peerDepsExternal(),
      postcss({ modules: true, minimize: true, extract: false, inject: true }),
      resolve({ extensions }),
      babel({ extensions, babelHelpers: "bundled", include: ["src/**/*"], exclude: "node_modules/**" }),
      commonjs(),
      typescript({ tsconfig: "./tsconfig.json", sourceMap: true, inlineSources: true }),
      terser(),
    ],
    external: Object.keys(packageJson.peerDependencies || {}),
  },
  {
    input: "dist/esm/types/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "esm" }],
    plugins: [dts()],
    external: [/\.css$/],
  },
]
