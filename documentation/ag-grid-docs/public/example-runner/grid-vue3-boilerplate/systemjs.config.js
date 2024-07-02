(function (global) {
    System.config({
        // DEMO ONLY! REAL CODE SHOULD NOT TRANSPILE IN THE BROWSER
        transpiler: 'ts',
        typescriptOptions: {
            target: 'es2020',
        },
        meta: {
            typescript: {
                exports: 'ts',
            },
            '*.css': { loader: 'css' },
        },
        defaultExtension: 'js',
        paths: {
            // paths serve as alias
            'npm:': 'https://cdn.jsdelivr.net/npm/',
            ...systemJsPaths,
        },
        map: {
            css: (boilerplatePath.length === 0 ? `./` : `${boilerplatePath}/`) + 'css.js',

            ts: 'npm:plugin-typescript@8.0.0/lib/plugin.js',
            tslib: 'npm:tslib@2.3.1/tslib.js',
            typescript: 'npm:typescript@5.4.5/lib/typescript.min.js',

            vue: 'npm:vue@3.2.29/dist/vue.esm-browser.js',
            '@vue/reactivity': 'npm:@vue/reactivity@3.0.0/dist/reactivity.esm-browser.prod.js',

            // vue class component
            'vue-class-component': 'npm:vue-class-component@^8.0.0-beta.3/dist/vue-class-component.cjs.js',

            app: appLocation + 'app',
            // systemJsMap comes from index.html
            ...systemJsMap,
        },
        packages: {
            vue: {
                defaultExtension: 'js',
            },
            'vue-class-component': {
                defaultExtension: 'js',
            },
            'vue-property-decorator': {
                defaultExtension: 'js',
            },
            app: {
                defaultExtension: 'js',
            },
            '@ag-grid-community/vue3': {
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
            '@ag-grid-community/locale': {
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
            'ag-grid-vue3': {
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
    });
})(this);

window.addEventListener('error', (e) => {
    console.error('ERROR', e.message, e.filename);
});
