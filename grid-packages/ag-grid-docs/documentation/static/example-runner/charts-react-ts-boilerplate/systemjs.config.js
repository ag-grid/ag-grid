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
        transpiler: 'ts',
        typescriptOptions: {
            module: 'system',
            moduleResolution: 'node',
            target: 'es5',
            noImplicitAny: false,
            sourceMap: true,
            jsx: 'react',
            lib: ['es2015', 'dom'],
        },
        paths: assign(
            {
                // paths serve as alias
                'npm:': 'https://cdn.jsdelivr.net/npm/',
            },
            systemJsPaths
        ),
        map: assign(
            {
                // css plugin
                css: boilerplatePath + "css.js",
                // css: 'npm:systemjs-plugin-css@0.1.37/css.js',

                // babel transpiler
                'plugin-babel':
                    'npm:systemjs-plugin-babel@0.0.25/plugin-babel.js',
                'systemjs-babel-build':
                    'npm:systemjs-plugin-babel@0.0.25/systemjs-babel-browser.js',

                // react
                react: 'npm:react@16.13.1',
                'react-dom': 'npm:react-dom@16.13.1',
                redux: 'npm:redux@3.6.0',
                'react-redux': 'npm:react-redux@5.0.6',
                'prop-types': 'npm:prop-types@15.8.1',

                ts: "npm:plugin-typescript@8.0.0/lib/plugin.js",
                typescript: "npm:typescript@4.0.8/lib/typescript.min.js",

                app: appLocation,
            },
            systemJsMap
        ), // systemJsMap comes from index.html

        packages: {
            css: {
            },
            react: {
                main: './umd/react.profiling.min.js',
            },
            'react-dom': {
                main: './umd/react-dom.profiling.min.js',
            },
            'react-dom/server': {
                main: '../umd/react-dom-server.browser.production.min.js',
            },
            'prop-types': {
                main: './prop-types.min.js',
                defaultExtension: 'js',
            },
            redux: {
                main: './dist/redux.min.js',
                defaultExtension: 'js',
            },
            'react-redux': {
                main: './dist/react-redux.min.js',
                defaultExtension: 'js',
            },
            app: {
                main: './index.tsx',
                defaultExtension: 'tsx',
            },
            'ag-charts-react': {
                main: './main.js',
                defaultExtension: 'js'
            }
        },
        meta: {
            typescript: {
                exports: 'ts',
            },
            '*.css': { loader: 'css' },
        },
    });
})(this);
