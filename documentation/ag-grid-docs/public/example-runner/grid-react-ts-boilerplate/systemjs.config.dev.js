(function (global) {
    var sjsPaths = {};
    if (typeof systemJsPaths !== 'undefined') {
        sjsPaths = systemJsPaths;
    }
    System.config({
        transpiler: 'ts',
        typescriptOptions: {
            target: 'es2020',
            jsx: 'react',
        },
        paths: {
            // paths serve as alias
            'npm:': 'https://cdn.jsdelivr.net/npm/',
            ...sjsPaths,
        },
        map: {
            // css: boilerplatePath + "css.js",
            css: 'npm:systemjs-plugin-css@0.1.37/css.js',

            // react
            react: 'npm:react@18.2.0',
            'react-dom': 'npm:react-dom@18.2.0',
            'react-dom/client': 'npm:react-dom@18.2.0',

            ts: 'npm:plugin-typescript@8.0.0/lib/plugin.js',
            typescript: 'npm:typescript@5.4.5/lib/typescript.min.js',

            app: appLocation,
            // systemJsMap comes from index.html
            ...systemJsMap,
        },

        packages: {
            css: {},
            react: {
                main: './umd/react.development.js',
            },
            'react-dom': {
                main: './umd/react-dom.development.js',
            },
            'react-dom/server': {
                main: '../umd/react-dom-server.browser.production.min.js',
            },
            app: {
                main: './index.tsx',
                defaultExtension: 'tsx',
            },
            '@ag-grid-community/react': {
                main: './dist/package/index.cjs.js',
                defaultExtension: 'js',
                format: 'cjs',
            },
            '@ag-grid-community/core': {
                main: './dist/package/main.cjs.js',
                defaultExtension: 'js',
                format: 'cjs',
            },
            '@ag-grid-community/client-side-row-model': {
                main: './dist/package/main.cjs.js',
                defaultExtension: 'js',
                format: 'cjs',
            },
            '@ag-grid-community/csv-export': {
                main: './dist/package/main.cjs.js',
                defaultExtension: 'js',
                format: 'cjs',
            },
            '@ag-grid-community/infinite-row-model': {
                main: './dist/package/main.cjs.js',
                defaultExtension: 'js',
                format: 'cjs',
            },
            '@ag-grid-community/locale': {
                main: './dist/package/main.cjs.js',
                defaultExtension: 'js',
                format: 'cjs',
            },
            '@ag-grid-community/theming': {
                main: './dist/package/main.cjs.js',
                defaultExtension: 'js',
                format: 'cjs',
            },
            '@ag-grid-enterprise/advanced-filter': {
                main: './dist/package/main.cjs.js',
                defaultExtension: 'js',
                format: 'cjs',
            },
            '@ag-grid-enterprise/charts': {
                main: './dist/package/main.cjs.js',
                defaultExtension: 'js',
                format: 'cjs',
            },
            '@ag-grid-enterprise/charts-enterprise': {
                main: './dist/package/main.cjs.js',
                defaultExtension: 'js',
            },
            '@ag-grid-enterprise/clipboard': {
                main: './dist/package/main.cjs.js',
                defaultExtension: 'js',
                format: 'cjs',
            },
            '@ag-grid-enterprise/column-tool-panel': {
                main: './dist/package/main.cjs.js',
                defaultExtension: 'js',
                format: 'cjs',
            },
            '@ag-grid-enterprise/core': {
                main: './dist/package/main.cjs.js',
                defaultExtension: 'js',
                format: 'cjs',
            },
            '@ag-grid-enterprise/excel-export': {
                main: './dist/package/main.cjs.js',
                defaultExtension: 'js',
                format: 'cjs',
            },
            '@ag-grid-enterprise/filter-tool-panel': {
                main: './dist/package/main.cjs.js',
                defaultExtension: 'js',
                format: 'cjs',
            },
            '@ag-grid-enterprise/master-detail': {
                main: './dist/package/main.cjs.js',
                defaultExtension: 'js',
                format: 'cjs',
            },
            '@ag-grid-enterprise/menu': {
                main: './dist/package/main.cjs.js',
                defaultExtension: 'js',
                format: 'cjs',
            },
            '@ag-grid-enterprise/multi-filter': {
                main: './dist/package/main.cjs.js',
                defaultExtension: 'js',
                format: 'cjs',
            },
            '@ag-grid-enterprise/range-selection': {
                main: './dist/package/main.cjs.js',
                defaultExtension: 'js',
                format: 'cjs',
            },
            '@ag-grid-enterprise/rich-select': {
                main: './dist/package/main.cjs.js',
                defaultExtension: 'js',
                format: 'cjs',
            },
            '@ag-grid-enterprise/row-grouping': {
                main: './dist/package/main.cjs.js',
                defaultExtension: 'js',
                format: 'cjs',
            },
            '@ag-grid-enterprise/server-side-row-model': {
                main: './dist/package/main.cjs.js',
                defaultExtension: 'js',
                format: 'cjs',
            },
            '@ag-grid-enterprise/set-filter': {
                main: './dist/package/main.cjs.js',
                defaultExtension: 'js',
                format: 'cjs',
            },
            '@ag-grid-enterprise/side-bar': {
                main: './dist/package/main.cjs.js',
                defaultExtension: 'js',
                format: 'cjs',
            },
            '@ag-grid-enterprise/sparklines': {
                main: './dist/package/main.cjs.js',
                defaultExtension: 'js',
                format: 'cjs',
            },
            '@ag-grid-enterprise/status-bar': {
                main: './dist/package/main.cjs.js',
                defaultExtension: 'js',
                format: 'cjs',
            },
            '@ag-grid-enterprise/viewport-row-model': {
                main: './dist/package/main.cjs.js',
                defaultExtension: 'js',
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
            'ag-grid-react': {
                main: './dist/package/index.cjs.js',
                defaultExtension: 'js',
                format: 'cjs',
            },
            'ag-charts-community': {
                main: './dist/package/main.cjs.js',
                defaultExtension: 'js',
                format: 'cjs',
            },
            'ag-enterprise-community': {
                main: './dist/package/main.cjs.js',
                defaultExtension: 'js',
                format: 'cjs',
            },
        },
        meta: {
            typescript: {
                exports: 'ts',
            },
            '*.css': { loader: 'css' },
        },
    });
})(this);

window.addEventListener('error', (e) => {
    console.error('ERROR', e.message, e.filename);
});
