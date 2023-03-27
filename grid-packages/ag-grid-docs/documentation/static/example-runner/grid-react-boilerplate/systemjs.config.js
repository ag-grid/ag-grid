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
            ...systemJsMap
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
                main: './dist/ag-grid-community.cjs.min.js',
                defaultExtension: 'js'
            },
            'ag-grid-enterprise': {
                main: './dist/ag-grid-enterprise.cjs.min.js',
                defaultExtension: 'js'
            },
            '@ag-grid-community/react': {
                main: './main.js',
                defaultExtension: 'js'
            }
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
