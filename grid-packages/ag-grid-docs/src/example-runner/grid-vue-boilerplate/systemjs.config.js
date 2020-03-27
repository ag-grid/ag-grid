(function (global) {
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
                // babel transpiler
                'plugin-babel': 'npm:systemjs-plugin-babel@0.0.25/plugin-babel.js',
                'systemjs-babel-build': 'npm:systemjs-plugin-babel@0.0.25/systemjs-babel-browser.js',

                // css plugin
                'css': 'npm:systemjs-plugin-css/css.js',

                // vuejs
                'vue': 'npm:vue/dist/vue.min.js',

                // vue property decorator
                'vue-class-component': 'npm:vue-class-component@6.3.2/dist/vue-class-component.min.js',
                'vue-property-decorator': 'npm:vue-property-decorator@7.2.0/lib/vue-property-decorator.umd.js',

                app: appLocation + 'app'
            },
            systemJsMap
        ), // systemJsMap comes from index.html

        packages: {
            'vue': {
                defaultExtension: 'js'
            },
            'vue-class-component': {
                defaultExtension: 'js'
            },
            'vue-property-decorator': {
                defaultExtension: 'js'
            },
            app: {
                defaultExtension: 'js'
            },
            'ag-grid-vue': {
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
            '@ag-grid-community/vue': {
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
            '*.js': {
                babelOptions: {
                    stage1: true,
                    stage2: true,
                    es2015: true
                }
            },
            '*.css': {loader: 'css'}
        }
    });
})(this);
