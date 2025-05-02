(function (global) {
    process = { env: { NODE_ENV: 'development' } };

    // Valid values: 18 / 19
    const REACT_VERSION = 19;
    const reactConfig =
        REACT_VERSION == 18
            ? {
                  map: {
                      react: 'npm:react@18.2.0',
                      'react-dom': 'npm:react-dom@18.2.0',
                      'react-dom/client': 'npm:react-dom@18.2.0',
                  },
                  packages: {
                      react: {
                          main: './umd/react.development.js',
                      },
                      'react-dom': {
                          main: './umd/react-dom.development.js',
                      },
                  },
              }
            : {
                  map: {
                      react: 'npm:react@19.1.0/cjs/react.development.js',
                      'react-dom': 'npm:react-dom@19.1.0/cjs/react-dom.development.js',
                      'react-dom/client': 'npm:react-dom@19.1.0/cjs/react-dom-client.development.js',
                      scheduler: 'npm:scheduler@0.26.0/cjs/scheduler.development.js',
                  },
                  packages: {
                      react: {
                          format: 'cjs',
                      },
                      'react-dom': {
                          format: 'cjs',
                      },
                      scheduler: {
                          format: 'cjs',
                      },
                  },
              };

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

            ...reactConfig.map,

            ts: 'npm:plugin-typescript@8.0.0/lib/plugin.js',
            typescript: 'npm:typescript@5.4.5/lib/typescript.min.js',

            app: appLocation,
            // systemJsMap comes from index.html
            ...systemJsMap,
        },

        packages: {
            css: {},
            ...reactConfig.packages,
            app: {
                main: './index.tsx',
                defaultExtension: 'tsx',
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
            'ag-grid-react': {
                main: './dist/package/index.cjs.js',
                defaultExtension: 'js',
                format: 'cjs',
            },
            'ag-charts-types': {
                main: './dist/package/main.cjs.js',
                defaultExtension: 'js',
                format: 'cjs',
            },
            'ag-charts-core': {
                main: './dist/package/main.cjs.js',
                defaultExtension: 'js',
                format: 'cjs',
            },
            'ag-charts-community': {
                main: './dist/package/main.cjs.js',
                defaultExtension: 'js',
                format: 'cjs',
            },
            'ag-charts-enterprise': {
                main: './dist/package/main.cjs.js',
                defaultExtension: 'js',
                format: 'cjs',
            },
            '@ag-grid-community/locale': {
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
