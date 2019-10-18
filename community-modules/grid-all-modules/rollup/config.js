const path = require('path');
const node = require('rollup-plugin-node-resolve');
const packageJson = require('../package.json');

const banner = ['/**',
    ` * ${ packageJson.name } - ${ packageJson.description }` +
    ` * @version v${ packageJson.version }`,
    ` * @link ${ packageJson.homepage }`,
    `' * @license ${ packageJson.license }`,
    ' */',
    ''].join('\n');

const builds = {
    'community-es-dev': {
        entry: path.resolve(__dirname, '../dist/es6/main.js'),
        dest: path.resolve(__dirname, '../dist/ag-grid.esm.js'),
        format: 'es',
        env: 'development',
        banner
    },
    'community-es-prod': {
        entry: path.resolve(__dirname, '../dist/es6/main.js'),
        dest: path.resolve(__dirname, '../dist/ag-grid.esm.min.js'),
        format: 'es',
        env: 'production',
        banner
    },
    'community-cjs-dev': {
        entry: path.resolve(__dirname, '../dist/es6/main.js'),
        dest: path.resolve(__dirname, '../dist/ag-grid.cjs.js'),
        format: 'cjs',
        env: 'development',
        banner
    },
    'community-cjs-prod': {
        entry: path.resolve(__dirname, '../dist/es6/main.js'),
        dest: path.resolve(__dirname, '../dist/ag-grid.cjs.min.js'),
        format: 'cjs',
        env: 'production',
        banner
    },
/*
    'community-umd-noStyle-dev': {
        entry: path.resolve(__dirname, '../dist/es6/main.js'),
        dest: path.resolve(__dirname, '../dist/ag-grid.noStyle.js'),
        format: 'umd',
        env: 'development',
        moduleName: 'agGrid',
        banner
    },
    'community-umd-noStyle-prod': {
        entry: path.resolve(__dirname, '../dist/es6/main.js'),
        dest: path.resolve(__dirname, '../dist/ag-grid.min.noStyle.js'),
        format: 'umd',
        env: 'production',
        moduleName: 'agGrid',
        banner
    }
*/
};

function genConfig(name) {
    const opts = builds[name];
    const config = {
        input: opts.entry,
        plugins: [
            node()      // for utils package - defaulting to use index.js
        ].concat(opts.plugins || []),
        output: {
            file: opts.dest,
            format: opts.format,
            banner: opts.banner,
            name: opts.moduleName
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
        value: name
    });

    return config
}

exports.getBuild = genConfig;
exports.getAllBuilds = () => Object.keys(builds).map(genConfig);
