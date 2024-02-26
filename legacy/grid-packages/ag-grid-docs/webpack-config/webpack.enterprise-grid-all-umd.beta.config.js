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
    .concat(glob.sync('../../grid-enterprise-modules/*', {ignore: ['../../grid-enterprise-modules/all-modules', '../../grid-enterprise-modules/charts-enterprise']}));

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
            "ag-charts-community": path.resolve('./node_modules/@ag-grid-enterprise/charts/node_modules/ag-charts-community/dist/package/main.cjs.js'),
            "@ag-grid-community/core": path.resolve(__dirname, "../../../grid-community-modules/core/src/ts/main.ts"),
            "@ag-grid-community/client-side-row-model": path.resolve(__dirname, "../../../grid-community-modules/client-side-row-model/src/main.ts"),
            "@ag-grid-community/infinite-row-model": path.resolve(__dirname, "../../../grid-community-modules/infinite-row-model/src/main.ts"),
            "@ag-grid-community/csv-export": path.resolve(__dirname, "../../../grid-community-modules/csv-export/src/main.ts"),
            "@ag-grid-enterprise/advanced-filter": path.resolve(__dirname, "../../../grid-enterprise-modules/advanced-filter/src/main.ts"),
            "@ag-grid-enterprise/core": path.resolve(__dirname, "../../../grid-enterprise-modules/core/src/main.ts"),
            "@ag-grid-enterprise/charts": path.resolve(__dirname, "../../../grid-enterprise-modules/charts/src/main.ts"),
            "@ag-grid-enterprise/clipboard": path.resolve(__dirname, "../../../grid-enterprise-modules/clipboard/src/main.ts"),
            "@ag-grid-enterprise/column-tool-panel": path.resolve(__dirname, "../../../grid-enterprise-modules/column-tool-panel/src/main.ts"),
            "@ag-grid-enterprise/excel-export": path.resolve(__dirname, "../../../grid-enterprise-modules/excel-export/src/main.ts"),
            "@ag-grid-enterprise/filter-tool-panel": path.resolve(__dirname, "../../../grid-enterprise-modules/filter-tool-panel/src/main.ts"),
            "@ag-grid-enterprise/master-detail": path.resolve(__dirname, "../../../grid-enterprise-modules/master-detail/src/main.ts"),
            "@ag-grid-enterprise/menu": path.resolve(__dirname, "../../../grid-enterprise-modules/menu/src/main.ts"),
            "@ag-grid-enterprise/multi-filter": path.resolve(__dirname, "../../../grid-enterprise-modules/multi-filter/src/main.ts"),
            "@ag-grid-enterprise/range-selection": path.resolve(__dirname, "../../../grid-enterprise-modules/range-selection/src/main.ts"),
            "@ag-grid-enterprise/rich-select": path.resolve(__dirname, "../../../grid-enterprise-modules/rich-select/src/main.ts"),
            "@ag-grid-enterprise/row-grouping": path.resolve(__dirname, "../../../grid-enterprise-modules/row-grouping/src/main.ts"),
            "@ag-grid-enterprise/server-side-row-model": path.resolve(__dirname, "../../../grid-enterprise-modules/sever-side-row-model/src/main.ts"),
            "@ag-grid-enterprise/set-filter": path.resolve(__dirname, "../../../grid-enterprise-modules/set-filter/src/main.ts"),
            "@ag-grid-enterprise/side-bar": path.resolve(__dirname, "../../../grid-enterprise-modules/side-bar/src/main.ts"),
            "@ag-grid-enterprise/sparklines": path.resolve(__dirname, "../../../grid-enterprise-modules/sparklines/src/main.ts"),
            "@ag-grid-enterprise/status-bar": path.resolve(__dirname, "../../../grid-enterprise-modules/status-bar/src/main.ts"),
            "@ag-grid-enterprise/viewport-row-model": path.resolve(__dirname, "../../../grid-enterprise-modules/viewport-row-model/src/main.ts")
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
