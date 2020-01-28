const path = require('path');

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebPackPlugin = require("html-webpack-plugin");
module.exports = {
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: path.resolve(__dirname, "node_modules"),

                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env", "@babel/preset-react"],
                        plugins: ["@babel/plugin-proposal-class-properties"]

                    }
                }
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: "html-loader"
                    }
                ]
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader"
                ]
            }
        ]
    },
    devtool: false,
    plugins: [
        new HtmlWebPackPlugin({
            template: "src/example-runner/packaged-builds/react/index.html"
        }),
        new MiniCssExtractPlugin({
            filename: 'styles.css'
        })
    ]
};
