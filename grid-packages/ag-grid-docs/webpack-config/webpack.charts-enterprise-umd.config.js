// for js examples that just require enterprise functionality (landing pages, vanilla enterprise examples etc)

const merge = require('webpack-merge');
const common = require('./webpack.charts-common.config');
const path = require("path");

module.exports = merge(common, {
    mode: 'development',

    entry: {
        'ag-charts-enterprise': './src/_assets/ts/ag-charts-enterprise-umd.js'
    },

    resolve: {
        alias: {
            "ag-charts-community": path.resolve(__dirname, "../../../charts-community-modules/ag-charts-community/src/main.ts")
        },
        extensions: [".ts", ".tsx", ".js"]
    },

    output: {
        filename: 'ag-charts-enterprise.js',
        library: ['agChartsEnterprise'],
        libraryTarget: 'umd',
        publicPath: '/',
        pathinfo: false
    }
});
