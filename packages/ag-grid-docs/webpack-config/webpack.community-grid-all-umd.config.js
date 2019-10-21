// for js examples that just require community functionality (landing pages, vanilla community examples etc)

const merge = require('webpack-merge');
const common = require('./webpack.common.config.js');
// const path = require('path');

module.exports = merge(common, {
    mode: 'development',
    entry: {
        '@ag-community/grid-all-modules': './src/_assets/ts/community-grid-all-modules-umd.js'
        // '@ag-community/grid-all-modules': ['./src/_assets/ts/community-grid-all-modules-umd.ts']
    },

    output: {
        filename: 'ag-grid-community.js',
        library: ['agGrid'],
        libraryTarget: 'umd',
        publicPath: '/'
    }
});
