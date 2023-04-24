// for js examples that just require community functionality (landing pages, vanilla community examples etc)

const merge = require('webpack-merge');
const common = require('./webpack.common.beta.config.js');
const glob = require('glob');

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
});

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

module.exports = merge(common, {
    mode: 'development',

    entry: {
        '@ag-grid-community/all-modules':
            moduleTsFiles.concat(['./src/_assets/ts/community-grid-all-modules-umd-beta.js'])
    },

    output: {
        filename: 'ag-grid-community.js',
        library: ['agGrid'],
        libraryTarget: 'umd',
        publicPath: '/',
        pathinfo: false
    }
});
