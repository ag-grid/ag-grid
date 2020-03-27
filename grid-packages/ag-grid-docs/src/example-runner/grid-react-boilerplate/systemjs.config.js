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
            'react-dom/server': {
                main: '../umd/react-dom-server.browser.production.min.js'
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
            '@ag-grid-community/core/dist/cjs/utils': {
                main: './index.js',
                defaultExtension: 'js'
            },
            '@ag-grid-enterprise/charts/dist/cjs/chartAdaptor/chartComp/menu/settings/miniCharts': {
                main: './index.js',
                defaultExtension: 'js'
            },
            /* START OF MODULES - DO NOT DELETE */
           '@ag-grid-community/all-modules': {
main: './dist/cjs/main.js',
defaultExtension: 'js'
},
           '@ag-grid-community/client-side-row-model': {
main: './dist/cjs/main.js',
defaultExtension: 'js'
},
           '@ag-grid-community/core': {
main: './dist/cjs/main.js',
defaultExtension: 'js'
},
           '@ag-grid-community/csv-export': {
main: './dist/cjs/main.js',
defaultExtension: 'js'
},
           '@ag-grid-community/infinite-row-model': {
main: './dist/cjs/main.js',
defaultExtension: 'js'
},
           'ag-charts-community': {
main: './dist/cjs/main.js',
defaultExtension: 'js'
},
           '@ag-grid-enterprise/all-modules': {
main: './dist/cjs/main.js',
defaultExtension: 'js'
},
           '@ag-grid-enterprise/charts': {
main: './dist/cjs/main.js',
defaultExtension: 'js'
},
           '@ag-grid-enterprise/clipboard': {
main: './dist/cjs/main.js',
defaultExtension: 'js'
},
           '@ag-grid-enterprise/column-tool-panel': {
main: './dist/cjs/main.js',
defaultExtension: 'js'
},
           '@ag-grid-enterprise/core': {
main: './dist/cjs/main.js',
defaultExtension: 'js'
},
           '@ag-grid-enterprise/date-time-cell-editor': {
main: './dist/cjs/main.js',
defaultExtension: 'js'
},
           '@ag-grid-enterprise/excel-export': {
main: './dist/cjs/main.js',
defaultExtension: 'js'
},
           '@ag-grid-enterprise/filter-tool-panel': {
main: './dist/cjs/main.js',
defaultExtension: 'js'
},
           '@ag-grid-enterprise/master-detail': {
main: './dist/cjs/main.js',
defaultExtension: 'js'
},
           '@ag-grid-enterprise/menu': {
main: './dist/cjs/main.js',
defaultExtension: 'js'
},
           '@ag-grid-enterprise/range-selection': {
main: './dist/cjs/main.js',
defaultExtension: 'js'
},
           '@ag-grid-enterprise/rich-select': {
main: './dist/cjs/main.js',
defaultExtension: 'js'
},
           '@ag-grid-enterprise/row-grouping': {
main: './dist/cjs/main.js',
defaultExtension: 'js'
},
           '@ag-grid-enterprise/server-side-row-model': {
main: './dist/cjs/main.js',
defaultExtension: 'js'
},
           '@ag-grid-enterprise/set-filter': {
main: './dist/cjs/main.js',
defaultExtension: 'js'
},
           '@ag-grid-enterprise/side-bar': {
main: './dist/cjs/main.js',
defaultExtension: 'js'
},
           '@ag-grid-enterprise/status-bar': {
main: './dist/cjs/main.js',
defaultExtension: 'js'
},
           '@ag-grid-enterprise/viewport-row-model': {
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
            '*.css': { loader: 'css' }
        }
    });
})(this);
