(function(global) {
    // simplified version of Object.assign for es3
    function assign() {
        var result = {};
        for (var i = 0, len = arguments.length; i < len; i++) {
            var arg = arguments[i];
            for (var prop in arg) {
                result[prop] = arg[prop];
            }
        }
        return result;
    }

    System.config({
        transpiler: 'plugin-babel',
        defaultExtension: 'js',
        paths: {
            'npm:': 'https://unpkg.com/'
        },
        map: assign(
            {
                // css plugin
                'css': 'npm:systemjs-plugin-css/css.js',

                // babel transpiler
                'plugin-babel': 'npm:systemjs-plugin-babel@0.0.25/plugin-babel.js',
                'systemjs-babel-build': 'npm:systemjs-plugin-babel@0.0.25/systemjs-babel-browser.js',

                // react
                react: 'npm:react@16.0.0',
                'react-dom': 'npm:react-dom@16.0.0',
                'react-dom-factories': 'npm:react-dom-factories',
                redux: 'npm:redux@3.6.0',
                'react-redux': 'npm:react-redux@5.0.6',
                'prop-types': 'npm:prop-types',

                app: appLocation + 'app'
            },
            systemJsMap
        ), // systemJsMap comes from index.html

        packages: {
            react: {
                main: './umd/react.production.min.js'
            },
            'react-dom': {
                main: './umd/react-dom.production.min.js'
            },
            'prop-types': {
                main: './prop-types.min.js',
                defaultExtension: 'js'
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
            // utils is a little different in that it's a directory...
            '@ag-community/grid-core/dist/cjs/utils': {
                main: './index.js',
                defaultExtension: 'js'
            },
            /* START OF MODULES - DO NOT DELETE */
           '@ag-community/client-side-row-model': { 
                main: './dist/cjs/main.js',
                defaultExtension: 'js'
            },
           '@ag-community/csv-export': { 
                main: './dist/cjs/main.js',
                defaultExtension: 'js'
            },
           '@ag-community/grid-all-modules': { 
                main: './dist/cjs/main.js',
                defaultExtension: 'js'
            },
           '@ag-community/grid-core': { 
                main: './dist/cjs/main.js',
                defaultExtension: 'js'
            },
           '@ag-community/infinite-row-model': { 
                main: './dist/cjs/main.js',
                defaultExtension: 'js'
            },
           '@ag-enterprise/charts': { 
                main: './dist/cjs/main.js',
                defaultExtension: 'js'
            },
           '@ag-enterprise/clipboard': { 
                main: './dist/cjs/main.js',
                defaultExtension: 'js'
            },
           '@ag-enterprise/column-tool-panel': { 
                main: './dist/cjs/main.js',
                defaultExtension: 'js'
            },
           '@ag-enterprise/excel-export': { 
                main: './dist/cjs/main.js',
                defaultExtension: 'js'
            },
           '@ag-enterprise/filter-tool-panel': { 
                main: './dist/cjs/main.js',
                defaultExtension: 'js'
            },
           '@ag-enterprise/grid-all-modules': { 
                main: './dist/cjs/main.js',
                defaultExtension: 'js'
            },
           '@ag-enterprise/grid-charts': { 
                main: './dist/cjs/main.js',
                defaultExtension: 'js'
            },
           '@ag-enterprise/grid-core': { 
                main: './dist/cjs/main.js',
                defaultExtension: 'js'
            },
           '@ag-enterprise/master-detail': { 
                main: './dist/cjs/main.js',
                defaultExtension: 'js'
            },
           '@ag-enterprise/menu': { 
                main: './dist/cjs/main.js',
                defaultExtension: 'js'
            },
           '@ag-enterprise/range-selection': { 
                main: './dist/cjs/main.js',
                defaultExtension: 'js'
            },
           '@ag-enterprise/rich-select': { 
                main: './dist/cjs/main.js',
                defaultExtension: 'js'
            },
           '@ag-enterprise/row-grouping': { 
                main: './dist/cjs/main.js',
                defaultExtension: 'js'
            },
           '@ag-enterprise/server-side-row-model': { 
                main: './dist/cjs/main.js',
                defaultExtension: 'js'
            },
           '@ag-enterprise/set-filter': { 
                main: './dist/cjs/main.js',
                defaultExtension: 'js'
            },
           '@ag-enterprise/side-bar': { 
                main: './dist/cjs/main.js',
                defaultExtension: 'js'
            },
           '@ag-enterprise/status-bar': { 
                main: './dist/cjs/main.js',
                defaultExtension: 'js'
            },
           '@ag-enterprise/viewport-row-model': { 
                main: './dist/cjs/main.js',
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
            '*.css': {loader: 'css'}
        }
    });
})(this);
