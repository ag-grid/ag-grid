const merge = require('webpack-merge');
const common = require('./webpack.common.config');

const webpack = require('webpack');
const path = require('path');

module.exports = merge(common, {
    entry: {
        'ag-grid': ['./src/_assets/ts/ag-grid.ts']
    },

    output: {
        filename: '[name].js',
        library: ['agGrid'],
        libraryTarget: 'umd',
        publicPath: '/'
    },

    plugins: [new webpack.NamedModulesPlugin(), new webpack.HotModuleReplacementPlugin()]
});
