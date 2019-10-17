const merge = require('webpack-merge');
const common = require('./webpack.common.config.js');
const path = require('path');

const webpack = require('webpack');

module.exports = merge(common, {
    mode: 'development',
    entry: {
        // 'dist/ag-grid-community': ['./src/_assets/ts/ag-grid-community.ts'] ???
    },

    resolve: {
        alias: {
            '@ag-community/grid-all-modules': path.resolve('./src/_assets/ts/community-grid-all-modules.ts')
            // '@ag-community/grid-core': path.resolve('./src/_assets/ts/ag-grid-community.ts')
        },
        extensions: ['.ts', '.js']
    },

    output: {
        filename: '[name].js',
        library: ['agGrid'],
        libraryTarget: 'umd',
        publicPath: '/'
    },

    plugins: [
        new webpack.NamedModulesPlugin()
    ]
});
