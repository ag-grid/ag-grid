const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');
const webpack = require('webpack');
const path = require('path');

module.exports = {
    devtool: 'inline-source-map',
    entry: ['webpack-hot-middleware/client'],
    externals: {
        angular: 'angular',
        react: 'react',
        'react-dom': 'react-dom'
    },
    resolve: {
        alias: {
            './dist/lib/main': './src/main.ts',
            './dist/lib': './src/ts'
        },
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    {loader: 'cache-loader'},
                    {
                        loader: 'thread-loader',
                        options: {
                            workers: require('os').cpus().length - 1
                        }
                    },
                    {
                        loader: 'ts-loader',
                        options: {
                            happyPackMode: true
                        }
                    }
                ]
            },
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    {loader: 'css-loader', options: {sourceMap: true}},
                    {loader: 'sass-loader', options: {sourceMap: true}},
                    {
                        loader: 'postcss-loader',
                        options: {
                            sourceMap: true,
                            syntax: 'postcss-scss',
                            plugins: [autoprefixer()]
                        }
                    }
                ]
            },
            {
                test: /\.(svg)$/,
                use: [
                    {loader: 'url-loader', options: {limit: 8192}},
                    {
                        loader: require.resolve('../../ag-grid/src/styles/svg-loader.js')
                    }
                ]
            }
        ]
    }
};
