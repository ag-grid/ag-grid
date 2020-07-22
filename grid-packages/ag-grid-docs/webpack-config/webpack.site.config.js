const webpack = require('webpack');
const path = require('path');
const autoprefixer = require('autoprefixer');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

let homepage = './src/_assets/homepage/homepage.ts';
let docs = './src/_assets/docs/docs.ts';

module.exports = {
    mode: 'development',
    devtool: 'eval-source-map',

    entry: {
        homepage: homepage,
        docs: docs,
    },
    output: {
        filename: '[name].js',
        publicPath: '/'
    },

    resolve: {
        extensions: [ '.ts', '.js', '.json' ]
    },

    externals: {
        'angular': 'angular',
        'react': 'react',
        'react-dom': 'react-dom'
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
                            happyPackMode: true,
                            configFile: path.resolve('./tsconfig.json')
                        }
                    }
                ]
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader",
                        options: {
                            minimize: true
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: [autoprefixer({
                                overrideBrowserslist: ["last 2 version"],
                                flexbox: true
                            })]
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            prependData: '$ag-compatibility-mode: false;\n$ag-suppress-all-theme-deprecation-warnings: true;',
                        },
                    },
                ]
            },
            {
                test: /\.(jpg|png|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {limit: 8192}
                    }
                ]
            },
            {
                test: /\.(svg)$/,
                use: [
                    {loader: 'url-loader', options: {limit: 20000}}
                ]
            }
        ]
    },

    plugins: [
        new webpack.NamedModulesPlugin(),
        new MiniCssExtractPlugin({filename: '[name].css'}),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
            Popper: ['popper.js', 'default']
            // In case you imported plugins individually, you must also require them here:
            // Util: 'exports-loader?Util!bootstrap/js/dist/util',
            // Dropdown: 'exports-loader?Dropdown!bootstrap/js/dist/dropdown'
        })
    ]
};
