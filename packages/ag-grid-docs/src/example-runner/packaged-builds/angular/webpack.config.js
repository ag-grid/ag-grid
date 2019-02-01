const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require("webpack");
const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');
const { CheckerPlugin } = require('awesome-typescript-loader')

module.exports = {
    mode: 'production',
    resolve: {
        extensions: ['.js', '.ts'],
        modules: [
            path.resolve(__dirname, '../../../../node_modules')
        ],
    },
    // entry: "./src/best-angular-2-data-grid/rich-grid-example/src/app.ts",
    // output: {
    //     path: path.resolve(__dirname, 'test'), // output directory
    //     filename: "[name].js"    // name of the generated bundle
    // },
    performance: {hints: false},
    module: {
        rules: [
            {
                test: /\.css$/,
                loader: ["style-loader", "css-loader"]
            },
            {
                test: /\.ts$/,
                loader: "awesome-typescript-loader",
                options: {
                    configFileName: "./src/example-runner/packaged-builds/angular/tsconfig.json"
                }
            },
            {
                test: /\.html$/,
                loader: "html-loader"
            },
            {
                test: /\.scss$/,
                loader: ["raw-loader", "sass-loader?sourceMap"]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "src/example-runner/packaged-builds/angular/index.html",
            inject: "body"
        }),

        new webpack.ContextReplacementPlugin(
            /\@angular(\\|\/)core(\\|\/)fesm5/,
            path.resolve(__dirname, 'src'), {}
        ),

        new FilterWarningsPlugin({
            exclude: /System.import/
        }),

        new CheckerPlugin()
    ],
    devtool: "source-map"
};


/*
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



*/
