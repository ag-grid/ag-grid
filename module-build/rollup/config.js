const path = require('path');
const {nodeResolve} = require('@rollup/plugin-node-resolve');
const replace = require('@rollup/plugin-replace');

const getBuilds = (umdModuleName, bundlePrefix, esmAutoRegister) => {
    const entries = [
        {
            name: 'commonjs-dev',
            inputMainFile: './dist/esm/es5/main.js',
            format: 'cjs',
            env: 'development',
            extension: '.cjs.js',
            config: {external: id => /@ag-grid-/.test(id)} // all other @ag-grid deps should be treated as externals so as to prevent duplicate modules when using more than one cjs file

        },
        {
            name: 'commonjs-prod',
            inputMainFile: './dist/esm/es5/main.js',
            format: 'cjs',
            env: 'production',
            extension: '.cjs.min.js',
            config: {external: id => /@ag-grid-/.test(id)} // all other @ag-grid deps should be treated as externals so as to prevent duplicate modules when using more than one cjs file

        },
        {
            name: 'es-modules-dev',
            inputMainFile: './dist/esm/es5/main.js',
            format: 'es',
            env: 'development',
            extension: '.esm.js'

        },
        {
            name: 'es-modules-prod',
            inputMainFile: './dist/esm/es5/main.js',
            format: 'es',
            env: 'production',
            extension: '.esm.min.js',
        }
    ]

    if (umdModuleName) {
        entries.push({
            name: 'umd-dev',
            inputMainFile: './dist/esm/es5/main.js',
            format: 'umd',
            env: 'development',
            moduleName: umdModuleName,
            extension: '.min.js'

        });
        entries.push({
            name: 'umd-prod',
            inputMainFile: './dist/esm/es5/main.js',
            format: 'umd',
            env: 'production',
            moduleName: umdModuleName,
            extension: '.js'

        });
    }

    if (esmAutoRegister) {
        entries.push({
            // contains only community or enterprise code (depending on source) - if enterprise community code is externalised
            // module are self registered
            name: 'es-modules-auto-dev',
            inputMainFile: './esm-main.auto.js',
            format: 'es',
            env: 'development',
            extension: '.auto.esm.js',
            config: {
                external: id => bundlePrefix === 'ag-grid-enterprise' ? 'ag-grid-community' === id || id.startsWith('@ag-grid-community') : false
            },
            plugins: bundlePrefix === 'ag-grid-enterprise' ? [
                replace({
                    preventAssignment: true,
                    values: {
                        '@ag-grid-community/core': 'ag-grid-community',
                        '@ag-grid-community/all-modules': 'ag-grid-community',
                        '@ag-grid-community/csv-export': 'ag-grid-community',
                        '@ag-grid-community/@ag-grid-community/client-side-row-model': 'ag-grid-community',
                        '@ag-grid-community/infinite-row-model': 'ag-grid-community'
                    },
                    delimiters: ['', '']
                })
            ] : []
        });
        entries.push({
            // contains only community or enterprise code (depending on source) - if enterprise community code is externalised
            // module are self registered
            name: 'es-modules-auto-prod',
            inputMainFile: './esm-main.auto.js',
            format: 'es',
            env: 'production',
            extension: '.auto.esm.min.js',
            config: {
                external: id => bundlePrefix === 'ag-grid-enterprise' ? 'ag-grid-community' === id || id.startsWith('@ag-grid-community') : false
            },
            plugins: bundlePrefix === 'ag-grid-enterprise' ? [
                replace({
                    preventAssignment: true,
                    values: {
                        '@ag-grid-community/core': 'ag-grid-community',
                        '@ag-grid-community/all-modules': 'ag-grid-community',
                        '@ag-grid-community/csv-export': 'ag-grid-community',
                        '@ag-grid-community/@ag-grid-community/client-side-row-model': 'ag-grid-community',
                        '@ag-grid-community/infinite-row-model': 'ag-grid-community'
                    },
                    delimiters: ['', '']
                })
            ] : []
        });
        entries.push({
            // like the umd bundles in that every is in here - both community and enterprise (if doing @ag-grid-enterprise/all-modules)
            // module are self registered
            // analogous to legacy ag-grid-community / ag-grid-enterprise packages
            name: 'es-modules-complete-dev',
            inputMainFile: './esm-main.complete.js',
            format: 'es',
            env: 'development',
            extension: '.auto.complete.esm.js'
        });
        entries.push({
            // like the umd bundles in that every is in here - both community and enterprise (if doing @ag-grid-enterprise/all-modules)
            // module are self registered
            // analogous to legacy ag-grid-community / ag-grid-enterprise packages
            name: 'es-modules-complete-prod',
            inputMainFile: './esm-main.complete.js',
            format: 'es',
            env: 'production',
            extension: '.auto.complete.esm.min.js'
        });
    }

    return entries;
}

function genConfig(build, sourceDirectory, moduleName) {
    const packageJson = require(path.resolve(sourceDirectory, './package.json'));

    const banner =
        `/**
          * ${packageJson.name} - ${packageJson.description} * @version v${packageJson.version}
          * @link ${packageJson.homepage}
          * @license ${packageJson.license}
          */`;

    const config = {
        ...(build.config ? build.config : {}),
        input: path.resolve(sourceDirectory, build.inputMainFile),
        plugins: [
            nodeResolve()      // for utils package - defaulting to use index.js
        ].concat(build.plugins || []),
        output: {
            file: path.resolve(sourceDirectory, `./dist/${moduleName}${build.extension}`),
            format: build.format,
            banner,
            name: build.moduleName
        },
        onwarn: (msg, warn) => {
            if (msg.code === 'THIS_IS_UNDEFINED') return;
            if (!/Circular/.test(msg)) {
                warn(msg)
            }
        }
    };

    Object.defineProperty(config, '_name', {
        enumerable: false,
        value: build.name
    });

    return config
}

exports.getAllBuilds = (sourceDirectory, bundlePrefix, esmType, umdModuleName) => {
    const buildsToUse = getBuilds(umdModuleName, bundlePrefix, esmType === 'autoRegister');
    return buildsToUse.map(build => genConfig(build, sourceDirectory, bundlePrefix));
}
