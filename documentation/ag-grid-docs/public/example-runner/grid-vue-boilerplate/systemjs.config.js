(function (global) {
    System.config({
        transpiler: 'plugin-babel',
        defaultExtension: 'js',
        paths:
            {
                // paths serve as alias
                "npm:": "https://cdn.jsdelivr.net/npm/",
                ...systemJsPaths
            },
        map: {
            // babel transpiler
            'plugin-babel': 'npm:systemjs-plugin-babel@0.0.25/plugin-babel.js',
            'systemjs-babel-build': 'npm:systemjs-plugin-babel@0.0.25/systemjs-babel-browser.js',

            css: (boilerplatePath.length === 0 ? `./` : `${boilerplatePath}/`) + "css.js",
            // 'css': 'npm:systemjs-plugin-css@0.1.37/css.js',


            // vuejs
            'vue': 'npm:vue@2.6.12/dist/vue.min.js',
            // vue property decorator
            'vue-class-component': 'npm:vue-class-component@6.3.2/dist/vue-class-component.min.js',
            'vue-property-decorator': 'npm:vue-property-decorator@7.2.0/lib/vue-property-decorator.umd.js',

            app: appLocation + 'app',
            // systemJsMap comes from index.html
            ...systemJsMap
        },
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
            '@ag-grid-community/vue': {
                main: './dist/package/main.cjs.js',
                defaultExtension: 'js',
                format: 'cjs',
            },
            '@ag-grid-community/core': {
                format: 'cjs',
            },
            '@ag-grid-community/client-side-row-model': {
                format: 'cjs',
            },
            '@ag-grid-community/csv-export': {
                format: 'cjs',
            },
            '@ag-grid-community/infinite-row-model': {
                format: 'cjs',
            },
            '@ag-grid-enterprise/advanced-filter': {
                format: 'cjs',
            },
            '@ag-grid-enterprise/charts': {
                format: 'cjs',
            },
            '@ag-grid-enterprise/charts-enterprise': {
                format: 'cjs',
            },
            '@ag-grid-enterprise/clipboard': {
                format: 'cjs',
            },
            '@ag-grid-enterprise/column-tool-panel': {
                format: 'cjs',
            },
            '@ag-grid-enterprise/core': {
                format: 'cjs',
            },
            '@ag-grid-enterprise/excel-export': {
                format: 'cjs',
            },
            '@ag-grid-enterprise/filter-tool-panel': {
                format: 'cjs',
            },
            '@ag-grid-enterprise/master-detail': {
                format: 'cjs',
            },
            '@ag-grid-enterprise/menu': {
                format: 'cjs',
            },
            '@ag-grid-enterprise/multi-filter': {
                format: 'cjs',
            },
            '@ag-grid-enterprise/range-selection': {
                format: 'cjs',
            },
            '@ag-grid-enterprise/rich-select': {
                format: 'cjs',
            },
            '@ag-grid-enterprise/row-grouping': {
                format: 'cjs',
            },
            '@ag-grid-enterprise/server-side-row-model': {
                format: 'cjs',
            },
            '@ag-grid-enterprise/set-filter': {
                format: 'cjs',
            },
            '@ag-grid-enterprise/side-bar': {
                format: 'cjs',
            },
            '@ag-grid-enterprise/sparklines': {
                format: 'cjs',
            },
            '@ag-grid-enterprise/status-bar': {
                format: 'cjs',
            },
            '@ag-grid-enterprise/viewport-row-model': {
                format: 'cjs',
            },
            'ag-grid-community': {
                main: './dist/package/main.cjs.js',
                defaultExtension: 'js',
                format: 'cjs',
            },
            'ag-grid-enterprise': {
                main: './dist/package/main.cjs.js',
                defaultExtension: 'js',
                format: 'cjs',
            },
            'ag-grid-charts-enterprise': {
                main: './dist/package/main.cjs.js',
                defaultExtension: 'js',
                format: 'cjs',
            },
            'ag-grid-vue': {
                main: './dist/package/main.cjs.js',
                defaultExtension: 'js',
                format: 'cjs',
            },
            'ag-charts-community': {
                defaultExtension: 'js',
                format: 'cjs',
            },
            'ag-charts-enterprise': {
                defaultExtension: 'js',
                format: 'cjs',
            },
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

window.addEventListener('error', e => {
    console.error('ERROR', e.message, e.filename)
});
