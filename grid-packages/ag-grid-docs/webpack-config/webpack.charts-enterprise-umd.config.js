// for js examples that just require enterprise functionality (landing pages, vanilla enterprise examples etc)

const merge = require('webpack-merge');
const common = require('./webpack.charts-common.config');

module.exports = merge(common, {
    mode: 'development',

    entry: {
        'ag-charts-enterprise': './src/_assets/ts/ag-charts-enterprise-umd.js'
    },

    output: {
        filename: 'ag-charts-enterprise.js',
        library: ['agChartsEnterprise'],
        libraryTarget: 'umd',
        publicPath: '/',
        pathinfo: false
    }
});
