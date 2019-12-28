// for js examples that just require community functionality (landing pages, vanilla community examples etc)

const merge = require('webpack-merge');
const common = require('./webpack.common.beta.config.js');
const glob = require('glob');

module.exports = merge(common, {
    mode: 'development',

    entry: {
        '@ag-grid-community/all-modules':
            glob.sync("../../community-modules/core/src/ts/**/*.ts")
                .concat(glob.sync("../../community-modules/client-side-row-model/src/**/*.ts"))
                .concat(glob.sync("../../community-modules/csv-export/src/**/*.ts"))
                .concat(glob.sync("../../community-modules/infinite-row-model/src/**/*.ts"))
                .concat(['./src/_assets/ts/community-grid-all-modules-umd-beta.js'])
    },

    output: {
        filename: 'ag-grid-community.js',
        library: ['agGrid'],
        libraryTarget: 'umd',
        publicPath: '/',
        pathinfo: false
    }
});
