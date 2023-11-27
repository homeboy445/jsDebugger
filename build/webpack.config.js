const fs = require("fs");
const path = require("path");
const webpack = require("webpack");

const licenseContent = fs.readFileSync(
  path.resolve(__dirname, "../LICENSE"),
  "utf8"
);
const isDevBuild = process.env.BUILD_MODE || "DEV";
console.log(
  "=> Building for ",
  isDevBuild == "DEV" ? "'DEV'" : "'PROD'",
  " mode >>",
  process.env.BUILD_MODE
);
const baseConfig = {
  entry: path.join(__dirname, "../src/index.ts"),
  output: {
    path: path.resolve(__dirname, "../dist"),
    library: "jsDebugger",
  },
  // devtool: false,
  resolve: {
    extensions: [".ts", ".js", ".json"],
  },
  mode: isDevBuild == "DEV" ? "development" : "production",
  devtool: false,
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
      },
    ],
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: licenseContent,
    }),
  ],
};

module.exports = baseConfig;
