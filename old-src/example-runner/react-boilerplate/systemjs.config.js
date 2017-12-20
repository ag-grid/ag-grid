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
            'ag-grid-enterprise': {
                main: './main.js',
                defaultExtension: 'js'
            }
        },
        meta: {
            '*.jsx': {
                babelOptions: {
                    react: true
                }
            }
        }
    });
})(this);
