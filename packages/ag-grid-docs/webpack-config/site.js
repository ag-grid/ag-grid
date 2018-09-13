const webpack = require('webpack');
const path = require('path');
const autoprefixer = require('autoprefixer');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

let homepage = './src/_assets/homepage/main.ts';
let docs = './src/_assets/docs/main.ts';

if (require('minimist')(process.argv.slice(2)).hmr) {
    homepage = ['./src/_assets/homepage/main.ts', 'webpack-hot-middleware/client?path=/dist/__webpack_hmr&reload=true'];
    docs = ['./src/_assets/docs/main.ts', 'webpack-hot-middleware/client?path=/dist/__webpack_hmr&reload=true'];
}

module.exports = {
    mode: 'development',
    devtool: 'inline-source-map',

    entry: {
        homepage: homepage,
        docs: docs,
    },
    output: {
        filename: '[name].js',
        publicPath: '/',
        hotUpdateChunkFilename: 'dist/[hash].hot-update.js',
        hotUpdateMainFilename: 'dist/[hash].hot-update.json'
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
                            plugins: [autoprefixer()]
                        }
                    },
                    "sass-loader"
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
                    {loader: 'url-loader', options: {limit: 20000}},
                    {
                        loader: 'svg-colorize-loader',
                        options: {color1: '#000000'}
                    }
                ]
            }
        ]
    },

    plugins: [
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin(),
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
