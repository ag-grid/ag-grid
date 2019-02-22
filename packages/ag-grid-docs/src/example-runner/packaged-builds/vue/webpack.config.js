const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebPackPlugin = require("html-webpack-plugin");

module.exports = {
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.js$/,
                loader: 'babel-loader'
            },
            {
                test: /\.css$/,
                use: [
                    'vue-style-loader',
                    'css-loader'
                ]
            }
        ]
    },
    resolve: {
        modules: [
            path.resolve(__dirname, '../../../../node_modules')
        ],
        alias: {
            'vue$': 'vue/dist/vue.min' // not really necessary
        }
    },
    devtool: false,
    plugins: [
        new VueLoaderPlugin(),

        new HtmlWebPackPlugin({
            template: "src/example-runner/packaged-builds/vue/index.html"
        })
    ]
};
