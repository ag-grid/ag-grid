const autoprefixer = require('autoprefixer');
const path = require('path');

module.exports = {
    mode: 'development',
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
                            happyPackMode: true,
                            configFile: path.resolve('./tsconfig.json')
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
                    {loader: 'url-loader', options: {limit: 20000}},
                    {
                        loader: 'svg-colorize-loader',
                        options: {color1: '#000000', color2: '#FFFFFF'}
                    }
                ]
            }
        ]
    }
};
