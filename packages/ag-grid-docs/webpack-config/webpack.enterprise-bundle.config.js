const merge = require('webpack-merge');
const common = require('./webpack.common.config.js');

const webpack = require('webpack');
const path = require('path');

/* mostly used by landing pages */
module.exports = merge(common, {
    mode: 'development',
    entry: {
        'ag-grid-enterprise': './src/_assets/ts/ag-grid-enterprise-bundle.ts'
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
            // 'ag-grid-community/dist/lib': path.resolve(__dirname, '../_dev/ag-grid-community/dist/lib'),
            // 'ag-grid-community/main': path.resolve('./src/_assets/ts/ag-grid-community.ts'),
            'ag-grid-community': path.resolve('./src/_assets/ts/ag-grid-community.ts'),
            // '@ag-community/client-side-row-model': path.resolve('../_dev/@ag-community/client-side-row-model-module/dist/cjs/main.js')
        },
        extensions: ['.ts', '.js']
    },

    plugins: [new webpack.NamedModulesPlugin(), new webpack.HotModuleReplacementPlugin()]
});
