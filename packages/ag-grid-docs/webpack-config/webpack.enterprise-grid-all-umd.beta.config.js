// for js examples that just require enterprise functionality (landing pages, vanilla enterprise examples etc)

const merge = require('webpack-merge');
const common = require('./webpack.common.beta.config.js');
const glob = require('glob');

/* mostly used by landing pages */
module.exports = merge(common, {
    entry: {
        '@ag-grid-enterprise/grid-all-modules':
            glob.sync('../../enterprise-modules/grid-core/src/**/*.ts', {nodir: true, ignore: "../../enterprise-modules/grid-core/**/*.test.ts"})
                .concat(glob.sync('../../enterprise-modules/grid-charts/src/**/*.ts', {nodir: true, ignore: "../../enterprise-modules/grid-charts/**/*.test.ts"}))
                .concat(glob.sync('../../enterprise-modules/grid-clipboard/src/**/*.ts', {nodir: true, ignore: "../../enterprise-modules/grid-clipboard/**/*.test.ts"}))
                .concat(glob.sync('../../enterprise-modules/grid-column-tool-panel/src/**/*.ts', {nodir: true, ignore: "../../enterprise-modules/grid-column-tool-panel/**/*.test.ts"}))
                .concat(glob.sync('../../enterprise-modules/grid-excel-export/src/**/*.ts', {nodir: true, ignore: "../../enterprise-modules/grid-excel-export/**/*.test.ts"}))
                .concat(glob.sync('../../enterprise-modules/grid-filter-tool-panel/src/**/*.ts', {nodir: true, ignore: "../../enterprise-modules/grid-filter-tool-panel/**/*.test.ts"}))
                .concat(glob.sync('../../enterprise-modules/grid-master-detail/src/**/*.ts', {nodir: true, ignore: "../../enterprise-modules/grid-master-detail/**/*.test.ts"}))
                .concat(glob.sync('../../enterprise-modules/grid-menu/src/**/*.ts', {nodir: true, ignore: "../../enterprise-modules/grid-menu/**/*.test.ts"}))
                .concat(glob.sync('../../enterprise-modules/grid-range-selection/src/**/*.ts', {nodir: true, ignore: "../../enterprise-modules/grid-range-selection/**/*.test.ts"}))
                .concat(glob.sync('../../enterprise-modules/grid-rich-select/src/**/*.ts', {nodir: true, ignore: "../../enterprise-modules/grid-rich-select/**/*.test.ts"}))
                .concat(glob.sync('../../enterprise-modules/grid-row-grouping/src/**/*.ts', {nodir: true, ignore: "../../enterprise-modules/grid-row-grouping/**/*.test.ts"}))
                .concat(glob.sync('../../enterprise-modules/grid-server-side-row-model/src/**/*.ts', {nodir: true, ignore: "../../enterprise-modules/grid-server-side-row-model/**/*.test.ts"}))
                .concat(glob.sync('../../enterprise-modules/grid-set-filter/src/**/*.ts', {nodir: true, ignore: "../../enterprise-modules/grid-set-filter/**/*.test.ts"}))
                .concat(glob.sync('../../enterprise-modules/grid-side-bar/src/**/*.ts', {nodir: true, ignore: "../../enterprise-modules/grid-side-bar/**/*.test.ts"}))
                .concat(glob.sync('../../enterprise-modules/grid-status-bar/src/**/*.ts', {nodir: true, ignore: "../../enterprise-modules/grid-status-bar/**/*.test.ts"}))
                .concat(glob.sync('../../enterprise-modules/grid-viewport-row-model/src/**/*.ts', {nodir: true, ignore: "../../enterprise-modules/grid-viewport-row-model/**/*.test.ts"}))
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
