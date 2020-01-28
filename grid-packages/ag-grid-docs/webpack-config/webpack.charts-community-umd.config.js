// for js examples that just require community functionality (landing pages, vanilla community examples etc)

const merge = require('webpack-merge');
const common = require('./webpack.charts-common.config');

module.exports = merge(common, {
    mode: 'development',

    entry: {
        'ag-charts-community': './src/_assets/ts/ag-charts-community-umd.js'
    },

    output: {
        filename: 'ag-charts-community.js',
        library: ['agCharts'],
        libraryTarget: 'umd',
        publicPath: '/',
        pathinfo: false
    }
});
