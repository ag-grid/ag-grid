const merge = require('webpack-merge');
const common = require('./common');

const webpack = require('webpack');
const path = require('path');

module.exports = merge(common, {
    entry: {
        'ag-grid-enterprise': './src/_assets/ts/ag-grid-enterprise.ts'
    },

    output: {
        filename: '[name].js',
        library: ['agGrid'],
        libraryTarget: 'umd',
        publicPath: '/',
        hotUpdateChunkFilename: 'dev/ag-grid-enterprise-bundle/[hash].hot-update.js',
        hotUpdateMainFilename:  'dev/ag-grid-enterprise-bundle/[hash].hot-update.json'
    },
    resolve: {
        alias: {
            'ag-grid/main': path.resolve('./src/_assets/ts/ag-grid.ts'),
            'ag-grid': path.resolve('./src/_assets/ts/ag-grid.ts')
        },
        extensions: ['.ts', '.js']
    },

    plugins: [new webpack.NamedModulesPlugin(), new webpack.HotModuleReplacementPlugin()]
});
