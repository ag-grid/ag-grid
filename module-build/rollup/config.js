const path = require('path');
const node = require('rollup-plugin-node-resolve');

const builds = {
    'esm-dev': {
        format: 'es',
        env: 'development',
        extension: '.esm.js'
    },
    'esm-prod': {
        format: 'es',
        env: 'production',
        extension: '.esm.min.js'
    },
    'cjs-dev': {
        format: 'cjs',
        env: 'development',
        extension: '.cjs.js',
    },
    'cjs-prod': {
        format: 'cjs',
        env: 'production',
        extension: '.cjs.min.js'
    }
};

function genConfig(buildsToUse, buildName, sourceDirectory, moduleName) {
    const packageJson = require(path.resolve(sourceDirectory, './package.json'));

    const banner = ['/**',
        ` * ${packageJson.name} - ${packageJson.description}` +
        ` * @version v${packageJson.version}`,
        ` * @link ${packageJson.homepage}`,
        `' * @license ${packageJson.license}`,
        ' */',
        ''].join('\n');

    const build = buildsToUse[buildName];

    const config = {
        input: path.resolve(sourceDirectory, `./dist/esm/es5/main.js`),
        plugins: [
            node()      // for utils package - defaulting to use index.js
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

    // cjs files are like modules - you need to import them individually
    // esm files are like umd files - they include everything
    if (!buildName.startsWith('esm')) {
        config['external'] = id => /@ag-grid-/.test(id); // all other @ag-grid deps should be treated as externals so as to prevent duplicate modules when using more than one cjs file
    }

    Object.defineProperty(config, '_name', {
        enumerable: false,
        value: buildName
    });

    return config
}

const getBuilds = (umdModuleName) => {
    const buildsToUse = {...builds};
    if (umdModuleName) {
        buildsToUse['umd-dev'] = {
            format: 'umd',
            env: 'development',
            moduleName: umdModuleName,
            extension: '.min.js'
        };
        buildsToUse['umd-prod'] = {
            format: 'umd',
            env: 'production',
            moduleName: umdModuleName,
            extension: '.js'
        }
    }
    return buildsToUse;
};

exports.getAllBuilds = (sourceDirectory, bundlePrefix, umdModuleName) => {
    const buildsToUse = getBuilds(umdModuleName);
    return Object.keys(buildsToUse).map(buildName => genConfig(buildsToUse, buildName, sourceDirectory, bundlePrefix));
};
