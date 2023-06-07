// for js examples that just require enterprise functionality (landing pages, vanilla enterprise examples etc)

const merge = require('webpack-merge');
const common = require('./webpack.common.beta.config.js');
const glob = require('glob');
const path = require("path");

const moduleDirectories = glob.sync('../../grid-community-modules/*', {
    ignore: [
        '../../grid-community-modules/all-modules',
        '../../grid-community-modules/core',
        '../../grid-community-modules/angular',
        '../../grid-community-modules/react',
        '../../grid-community-modules/vue',
        '../../grid-community-modules/vue3',
        '../../grid-community-modules/polymer'
    ]
})
    .concat(glob.sync('../../grid-enterprise-modules/*', {ignore: '../../grid-enterprise-modules/all-modules'}));

const mapDirectory = directory => glob.sync(`${directory}/src/**/*.ts`, {
    nodir: true,
    ignore: `${directory}/src/**/*.test.ts`
});

const flattenArray = array => [].concat.apply([], array);

const moduleTsFiles = glob.sync("../../grid-community-modules/core/src/ts/**/*.ts", {
    nodir: true,
    ignore: "../../grid-community-modules/core/src/ts/**/*.test.ts"
})
    .concat(flattenArray(moduleDirectories.map(mapDirectory)));

/* mostly used by landing pages */
module.exports = merge(common, {
    entry: {
        '@ag-grid-enterprise/all-modules':
            moduleTsFiles.concat(['./src/_assets/ts/enterprise-grid-all-modules-umd-beta.js'])
    },
    resolve: {
        alias: {
            "@ag-grid-community/core": path.resolve(__dirname, "../../../grid-community-modules/core/dist/esm/es6/main.js"),
            "@ag-grid-community/client-side-row-model": path.resolve(__dirname, "../../../grid-community-modules/client-side-row-model/dist/esm/es6/main.js"),
            "@ag-grid-community/infinite-row-model": path.resolve(__dirname, "../../../grid-community-modules/infinite-row-model/dist/esm/es6/main.js"),
            "@ag-grid-community/csv-export": path.resolve(__dirname, "../../../grid-community-modules/csv-export/dist/esm/es6/main.js"),
            "@ag-grid-enterprise/core": path.resolve(__dirname, "../../../grid-enterprise-modules/core/dist/esm/es6/main.js"),
            "@ag-grid-enterprise/charts": path.resolve(__dirname, "../../../grid-enterprise-modules/charts/dist/esm/es6/main.js"),
            "@ag-grid-enterprise/clipboard": path.resolve(__dirname, "../../../grid-enterprise-modules/clipboard/dist/esm/es6/main.js"),
            "@ag-grid-enterprise/column-tool-panel": path.resolve(__dirname, "../../../grid-enterprise-modules/column-tool-panel/dist/esm/es6/main.js"),
            "@ag-grid-enterprise/excel-export": path.resolve(__dirname, "../../../grid-enterprise-modules/excel-export/dist/esm/es6/main.js"),
            "@ag-grid-enterprise/filter-tool-panel": path.resolve(__dirname, "../../../grid-enterprise-modules/filter-tool-panel/dist/esm/es6/main.js"),
            "@ag-grid-enterprise/master-detail": path.resolve(__dirname, "../../../grid-enterprise-modules/master-detail/dist/esm/es6/main.js"),
            "@ag-grid-enterprise/menu": path.resolve(__dirname, "../../../grid-enterprise-modules/menu/dist/esm/es6/main.js"),
            "@ag-grid-enterprise/multi-filter": path.resolve(__dirname, "../../../grid-enterprise-modules/multi-filter/dist/esm/es6/main.js"),
            "@ag-grid-enterprise/range-selection": path.resolve(__dirname, "../../../grid-enterprise-modules/range-selection/dist/esm/es6/main.js"),
            "@ag-grid-enterprise/rich-select": path.resolve(__dirname, "../../../grid-enterprise-modules/rich-select/dist/esm/es6/main.js"),
            "@ag-grid-enterprise/row-grouping": path.resolve(__dirname, "../../../grid-enterprise-modules/row-grouping/dist/esm/es6/main.js"),
            "@ag-grid-enterprise/server-side-row-model": path.resolve(__dirname, "../../../grid-enterprise-modules/sever-side-row-model/dist/esm/es6/main.js"),
            "@ag-grid-enterprise/set-filter": path.resolve(__dirname, "../../../grid-enterprise-modules/set-filter/dist/esm/es6/main.js"),
            "@ag-grid-enterprise/side-bar": path.resolve(__dirname, "../../../grid-enterprise-modules/side-bar/dist/esm/es6/main.js"),
            "@ag-grid-enterprise/sparklines": path.resolve(__dirname, "../../../grid-enterprise-modules/sparklines/dist/esm/es6/main.js"),
            "@ag-grid-enterprise/status-bar": path.resolve(__dirname, "../../../grid-enterprise-modules/status-bar/dist/esm/es6/main.js"),
            "@ag-grid-enterprise/viewport-row-model": path.resolve(__dirname, "../../../grid-enterprise-modules/viewport-row-model/dist/esm/es6/main.js")
        },
        extensions: [".ts", ".tsx", ".js"]
    },
    output: {
        filename: 'ag-grid-enterprise.js',
        library: ['agGrid'],
        libraryTarget: 'umd',
        publicPath: '/',
        pathinfo: false
    }
});
