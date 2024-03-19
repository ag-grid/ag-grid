(function (global) {
    System.config({
        // DEMO ONLY! REAL CODE SHOULD NOT TRANSPILE IN THE BROWSER
        transpiler: "ts",
        typescriptOptions: {
            // Copy of compiler options in standard tsconfig.json
            target: "es2015",
            module: "system", //gets rid of console warning
            moduleResolution: "node",
            sourceMap: false,
            emitDecoratorMetadata: true,
            experimentalDecorators: true,
            lib: ["es2015", "dom"],
            noImplicitAny: true,
            suppressImplicitAnyIndexErrors: true
        },
        meta: {
            typescript: {
                exports: "ts"
            },
            '*.css': {loader: 'css'}
        },
        paths:
            {
                // paths serve as alias
                "npm:": "https://cdn.jsdelivr.net/npm/",
                ...systemJsPaths
            },
        // map tells the System loader where to look for things
        map: {
            css: (boilerplatePath.length === 0 ? `./` : `${boilerplatePath}/`) + "css.js",
            // 'css': 'npm:systemjs-plugin-css@0.1.37/css.js',

            ts: "npm:plugin-typescript@8.0.0/lib/plugin.js",
            tslib: "npm:tslib@2.3.1/tslib.js",
            typescript: "npm:typescript@4.3.5/lib/typescript.min.js",

            // appLocation comes from index.html
            app: appLocation,
            ...systemJsMap
        },
        // packages tells the System loader how to load when no filename and/or no extension
        packages: {
            css: {},
            app: {
                main: "./main.ts",
                defaultExtension: "ts",
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
            'ag-charts-community': {
                defaultExtension: 'js',
                format: 'cjs',
            },
            'ag-charts-enterprise': {
                defaultExtension: 'js',
                format: 'cjs',
            },
        }
    });
})(this);

window.addEventListener('error', e => {
    console.error('ERROR', e.message, e.filename)
});
