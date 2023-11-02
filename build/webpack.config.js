const path = require("path");

const isDevBuild = "DEV" || process.env.BUILD_MODE == "DEV";
console.log("=> Building for ", isDevBuild ? "'DEV'" : "'PROD'", " mode");
const baseConfig = {
  entry: path.join(__dirname, "../src/index.ts"),
  output: {
    path: path.resolve(__dirname, "../dist"),
    library: "jsDebugger"
  },
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
  mode: isDevBuild ? "development" : "production",
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [/node_modules/, /dist/, /release/, /src\/types\/index.d.ts/],
        loader: "ts-loader",
      },
      {
        test: /\.(?:js|mjs|cjs)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]],
          },
        },
      }
    ],
  },
};

// const umdExportConfig = merge(baseConfig, {
//   output: { filename: "main.min.js", libraryTarget: "umd", library: "promiseButler", },
// });

// const commonJsExportConfig = merge(baseConfig, {
//   output: { filename: "main.cjs", libraryTarget: "commonjs2" },
// });

module.exports = baseConfig;
