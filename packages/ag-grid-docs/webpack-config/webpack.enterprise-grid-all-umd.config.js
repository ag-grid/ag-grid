// for js examples that just require enterprise functionality (landing pages, vanilla enterprise examples etc)

const merge = require('webpack-merge');
const common = require('./webpack.common.config.js');
const webpack = require('webpack');

/* mostly used by landing pages */
module.exports = merge(common, {
    mode: 'development',
    entry: {
        '@ag-grid-enterprise/all-modules': './src/_assets/ts/enterprise-grid-all-modules-umd.js'
    },

    output: {
        filename: 'ag-grid-enterprise.js',
        library: ['agGrid'],
        libraryTarget: 'umd',
        publicPath: '/'
    },

    plugins: [new webpack.NamedModulesPlugin()]
});
