// for js examples that just require community functionality (landing pages, vanilla community examples etc)

const merge = require('webpack-merge');
const common = require('./webpack.common.config.js');

module.exports = merge(common, {
    mode: 'development',
    entry: {
        '@ag-grid-community/all-modules': './src/_assets/ts/community-grid-all-modules-umd.js'
    },

    output: {
        filename: 'ag-grid-community.js',
        library: ['agGrid'],
        libraryTarget: 'umd',
        publicPath: '/'
    }
});
