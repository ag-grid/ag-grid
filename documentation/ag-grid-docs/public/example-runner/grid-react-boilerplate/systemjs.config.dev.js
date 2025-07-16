(function (global) {
    const urlParams = new URLSearchParams(window.location.search);
    const config = {
        // Suggested defaults: 19.1.0 or 18.2.0
        version: urlParams.get('version') ?? '19.1.0',
        prod: urlParams.get('prod') ?? false,
    };

    process = { env: { NODE_ENV: 'development' } };
    const REACT_VERSION = config.version;
    const filePart = config.prod ? 'production.min' : 'development';
    const reactConfig = !config.version.startsWith('19')
        ? {
              map: {
                  react: `npm:react@${REACT_VERSION}`,
                  'react-dom': `npm:react-dom@${REACT_VERSION}`,
                  'react-dom/client': `npm:react-dom@${REACT_VERSION}`,
              },
              packages: {
                  react: {
                      main: `./umd/react.${filePart}.js`,
                  },
                  'react-dom': {
                      main: `./umd/react-dom.${filePart}.js`,
                  },
              },
          }
        : {
              map: {
                  react: `npm:react@${REACT_VERSION}/cjs/react.${filePart}.js`,
                  'react-dom': `npm:react-dom@${REACT_VERSION}/cjs/react-dom.${filePart}.js`,
                  'react-dom/client': `npm:react-dom@${REACT_VERSION}/cjs/react-dom-client.${filePart}.js`,
                  scheduler: `npm:scheduler@0.26.0/cjs/scheduler.${filePart}.js`,
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

    window.addEventListener('error', (e) => {
        console.error('ERROR', e.message, e.filename);
    });

    System.import(startFile).catch(function (err) {
        document.body.innerHTML =
            '<div class="example-error" style="background:#fdb022;padding:1rem;">' + 'Example Error: ' + err + '</div>';
        console.error(err);
    });
})(this);
