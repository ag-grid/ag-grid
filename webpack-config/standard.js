const merge = require('webpack-merge');
const common = require('./common');
const tsChecker = require('./fork-ts-checker.ts');

const webpack = require('webpack');
const path = require('path');

module.exports = merge(common, {
    entry: {
        'dist/ag-grid': ['./src/_assets/ts/ag-grid.ts']
    },

    output: {
        filename: '[name].js',
        library: ['agGrid'],
        libraryTarget: 'umd',
        publicPath: 'http://localhost:8080/'
    },

    plugins: [
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin()
    ]
});
