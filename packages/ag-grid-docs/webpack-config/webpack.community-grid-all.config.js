const merge = require('webpack-merge');
const common = require('./webpack.common.config.js');
const path = require('path');

module.exports = merge(common, {
    mode: 'development',
    entry: {
        '@ag-community/grid-all-modules': ['./src/_assets/ts/community-grid-all-modules.ts']
    },

    // resolve: {
    //     alias: {
    //         '@ag-community/grid-all-modules': path.resolve('./src/_assets/ts/community-grid-all-modules.ts')
    //     },
    //     extensions: ['.ts', '.js']
    // },

    output: {
        filename: 'ag-grid-community.js',
        library: ['agGrid'],
        libraryTarget: 'umd',
        publicPath: '/'
    }
});
