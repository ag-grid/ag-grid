(function (global) {
    process = { env: { NODE_ENV: 'development' } };

    // Valid values: 18 / 19
    const REACT_VERSION = 18;
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
                          main: './umd/react.production.min.js',
                      },
                      'react-dom': {
                          main: './umd/react-dom.production.min.js',
                      },
                  },
              }
            : {
                  map: {
                      react: 'npm:react@19.1.0/cjs/react.production.min.js',
                      'react-dom': 'npm:react-dom@19.1.0/cjs/react-dom.production.min.js',
                      'react-dom/client': 'npm:react-dom@19.1.0/cjs/react-dom-client.production.min.js',
                      scheduler: 'npm:scheduler@0.26.0/cjs/scheduler.production.min.js',
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

    System.config({
        transpiler: 'ts',
        typescriptOptions: {
            target: 'es2020',
            jsx: 'react',
        },
        paths: {
            // paths serve as alias
            'npm:': 'https://cdn.jsdelivr.net/npm/',
            ...systemJsPaths,
        },
        map: {
            css: (boilerplatePath.length === 0 ? `./` : `${boilerplatePath}/`) + 'css.js',

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
                main: './index.jsx',
                defaultExtension: 'jsx',
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
                defaultExtension: 'js',
                format: 'cjs',
            },
            'ag-charts-core': {
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
            '@ag-grid-community/locale': {
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
