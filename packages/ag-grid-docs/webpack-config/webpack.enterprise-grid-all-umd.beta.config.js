// for js examples that just require enterprise functionality (landing pages, vanilla enterprise examples etc)

const merge = require('webpack-merge');
const common = require('./webpack.common.beta.config.js');
const glob = require('glob');

/* mostly used by landing pages */
module.exports = merge(common, {
    entry: {
        '@ag-grid-enterprise/all-modules':
            glob.sync('../../enterprise-modules/core/src/**/*.ts', {nodir: true, ignore: "../../enterprise-modules/core/**/*.test.ts"})
                .concat(glob.sync('../../enterprise-modules/charts/src/**/*.ts', {nodir: true, ignore: "../../enterprise-modules/charts/**/*.test.ts"}))
                .concat(glob.sync('../../enterprise-modules/clipboard/src/**/*.ts', {nodir: true, ignore: "../../enterprise-modules/clipboard/**/*.test.ts"}))
                .concat(glob.sync('../../enterprise-modules/column-tool-panel/src/**/*.ts', {nodir: true, ignore: "../../enterprise-modules/column-tool-panel/**/*.test.ts"}))
                .concat(glob.sync('../../enterprise-modules/excel-export/src/**/*.ts', {nodir: true, ignore: "../../enterprise-modules/excel-export/**/*.test.ts"}))
                .concat(glob.sync('../../enterprise-modules/filter-tool-panel/src/**/*.ts', {nodir: true, ignore: "../../enterprise-modules/filter-tool-panel/**/*.test.ts"}))
                .concat(glob.sync('../../enterprise-modules/master-detail/src/**/*.ts', {nodir: true, ignore: "../../enterprise-modules/master-detail/**/*.test.ts"}))
                .concat(glob.sync('../../enterprise-modules/menu/src/**/*.ts', {nodir: true, ignore: "../../enterprise-modules/menu/**/*.test.ts"}))
                .concat(glob.sync('../../enterprise-modules/range-selection/src/**/*.ts', {nodir: true, ignore: "../../enterprise-modules/range-selection/**/*.test.ts"}))
                .concat(glob.sync('../../enterprise-modules/rich-select/src/**/*.ts', {nodir: true, ignore: "../../enterprise-modules/rich-select/**/*.test.ts"}))
                .concat(glob.sync('../../enterprise-modules/row-grouping/src/**/*.ts', {nodir: true, ignore: "../../enterprise-modules/row-grouping/**/*.test.ts"}))
                .concat(glob.sync('../../enterprise-modules/server-side-row-model/src/**/*.ts', {nodir: true, ignore: "../../enterprise-modules/server-side-row-model/**/*.test.ts"}))
                .concat(glob.sync('../../enterprise-modules/set-filter/src/**/*.ts', {nodir: true, ignore: "../../enterprise-modules/set-filter/**/*.test.ts"}))
                .concat(glob.sync('../../enterprise-modules/side-bar/src/**/*.ts', {nodir: true, ignore: "../../enterprise-modules/side-bar/**/*.test.ts"}))
                .concat(glob.sync('../../enterprise-modules/status-bar/src/**/*.ts', {nodir: true, ignore: "../../enterprise-modules/status-bar/**/*.test.ts"}))
                .concat(glob.sync('../../enterprise-modules/viewport-row-model/src/**/*.ts', {nodir: true, ignore: "../../enterprise-modules/viewport-row-model/**/*.test.ts"}))
                .concat(['./src/_assets/ts/enterprise-grid-all-modules-umd-beta.js'])
    },

    output: {
        filename: 'ag-grid-enterprise.js',
        library: ['agGrid'],
        libraryTarget: 'umd',
        publicPath: '/',
        pathinfo: false
    }
});
