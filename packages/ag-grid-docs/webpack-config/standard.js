const merge = require('webpack-merge');
const common = require('./common');

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
        publicPath: '/',
        hotUpdateChunkFilename: 'dev/ag-grid/[hash].hot-update.js',
        hotUpdateMainFilename: 'dev/ag-grid/[hash].hot-update.json'
    },

    plugins: [
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin()
    ]
});
