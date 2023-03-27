(function (global) {

    System.config({
        transpiler: 'plugin-babel',
        defaultExtension: 'js',
        paths: {
            'npm:': 'https://cdn.jsdelivr.net/npm/'
        },
        map: {
            css: boilerplatePath + "css.js",

            // babel transpiler
            'plugin-babel': 'npm:systemjs-plugin-babel@0.0.25/plugin-babel.js',
            'systemjs-babel-build': 'npm:systemjs-plugin-babel@0.0.25/systemjs-babel-browser.js',

            // react
            react: 'npm:react@18.2.0',
            'react-dom': 'npm:react-dom@18.2.0',
            'react-dom/client': 'npm:react-dom@18.2.0',
            redux: 'npm:redux@3.6.0',
            'react-redux': 'npm:react-redux@5.0.6',

            app: appLocation + 'app',

            // systemJsMap comes from index.html
            ...systemJsMap,
        },
        packages: {
            react: {
                main: './umd/react.profiling.min.js'
            },
            'react-dom': {
                main: './umd/react-dom.profiling.min.js'
            },
            'react-dom/server': {
                main: '../umd/react-dom-server.browser.production.min.js'
            },
            redux: {
                main: './dist/redux.min.js',
                defaultExtension: 'js'
            },
            'react-redux': {
                main: './dist/react-redux.min.js',
                defaultExtension: 'js'
            },
            app: {
                defaultExtension: 'jsx'
            },
            'ag-grid-react': {
                main: './main.js',
                defaultExtension: 'js'
            },
            'ag-grid-community': {
                main: './dist/ag-grid-community.cjs.js',
                defaultExtension: 'js'
            },
            'ag-grid-enterprise': {
                main: './dist/ag-grid-enterprise.cjs.js',
                defaultExtension: 'js'
            },
            '@ag-grid-community/react': {
                main: './main.js',
                defaultExtension: 'js'
            },
            // these are a little different in that they're in a directory and sjs doesn't default to the index.js inside...
            '@ag-grid-community/core/dist/cjs/es5/utils': {
                main: './index.js',
                defaultExtension: 'js'
            },
            '@ag-grid-enterprise/charts/dist/cjs/es5/charts/chartComp/menu/settings/miniCharts': {
                main: './index.js',
                defaultExtension: 'js'
            },
            /* START OF MODULES - DO NOT DELETE */
            '@ag-grid-community/all-modules': {
                main: './dist/cjs/es5/main.js',
                defaultExtension: 'js'
            },
            '@ag-grid-community/client-side-row-model': {
                main: './dist/cjs/es5/main.js',
                defaultExtension: 'js'
            },
            '@ag-grid-community/core': {
                main: './dist/cjs/es5/main.js',
                defaultExtension: 'js'
            },
            '@ag-grid-community/csv-export': {
                main: './dist/cjs/es5/main.js',
                defaultExtension: 'js'
            },
            '@ag-grid-community/infinite-row-model': {
                main: './dist/cjs/es5/main.js',
                defaultExtension: 'js'
            },
            'ag-charts-community': {
                main: './dist/cjs/es5/main.js',
                defaultExtension: 'js'
            },
            '@ag-grid-enterprise/all-modules': {
                main: './dist/cjs/es5/main.js',
                defaultExtension: 'js'
            },
            '@ag-grid-enterprise/charts': {
                main: './dist/cjs/es5/main.js',
                defaultExtension: 'js'
            },
            '@ag-grid-enterprise/clipboard': {
                main: './dist/cjs/es5/main.js',
                defaultExtension: 'js'
            },
            '@ag-grid-enterprise/column-tool-panel': {
                main: './dist/cjs/es5/main.js',
                defaultExtension: 'js'
            },
            '@ag-grid-enterprise/core': {
                main: './dist/cjs/es5/main.js',
                defaultExtension: 'js'
            },
            '@ag-grid-enterprise/excel-export': {
                main: './dist/cjs/es5/main.js',
                defaultExtension: 'js'
            },
            '@ag-grid-enterprise/filter-tool-panel': {
                main: './dist/cjs/es5/main.js',
                defaultExtension: 'js'
            },
            '@ag-grid-enterprise/master-detail': {
                main: './dist/cjs/es5/main.js',
                defaultExtension: 'js'
            },
            '@ag-grid-enterprise/menu': {
                main: './dist/cjs/es5/main.js',
                defaultExtension: 'js'
            },
            '@ag-grid-enterprise/multi-filter': {
                main: './dist/cjs/es5/main.js',
                defaultExtension: 'js'
            },
            '@ag-grid-enterprise/range-selection': {
                main: './dist/cjs/es5/main.js',
                defaultExtension: 'js'
            },
            '@ag-grid-enterprise/rich-select': {
                main: './dist/cjs/es5/main.js',
                defaultExtension: 'js'
            },
            '@ag-grid-enterprise/row-grouping': {
                main: './dist/cjs/es5/main.js',
                defaultExtension: 'js'
            },
            '@ag-grid-enterprise/server-side-row-model': {
                main: './dist/cjs/es5/main.js',
                defaultExtension: 'js'
            },
            '@ag-grid-enterprise/set-filter': {
                main: './dist/cjs/es5/main.js',
                defaultExtension: 'js'
            },
            '@ag-grid-enterprise/side-bar': {
                main: './dist/cjs/es5/main.js',
                defaultExtension: 'js'
            },
            '@ag-grid-enterprise/sparklines': {
                main: './dist/cjs/es5/main.js',
                defaultExtension: 'js'
            },
            '@ag-grid-enterprise/status-bar': {
                main: './dist/cjs/es5/main.js',
                defaultExtension: 'js'
            },
            '@ag-grid-enterprise/viewport-row-model': {
                main: './dist/cjs/es5/main.js',
                defaultExtension: 'js'
            },
            /* END OF MODULES - DO NOT DELETE */
        },
        meta: {
            '*.jsx': {
                babelOptions: {
                    react: true
                }
            },
            '*.css': { loader: 'css' }
        }
    });
})(this);
