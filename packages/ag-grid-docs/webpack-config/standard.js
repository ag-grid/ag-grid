const merge = require('webpack-merge');
const common = require('./common');

const webpack = require('webpack');

module.exports = merge(common, {
    mode: 'development',
    entry: {
        'dist/ag-grid-community': ['./src/_assets/ts/ag-grid-community.ts']
    },

    output: {
        filename: '[name].js',
        library: ['agGrid'],
        libraryTarget: 'umd',
        publicPath: '/',
        hotUpdateChunkFilename: 'dev/ag-grid-community/[hash].hot-update.js',
        hotUpdateMainFilename: 'dev/ag-grid-community/[hash].hot-update.json'
    },

    plugins: [
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin()
    ]
});
