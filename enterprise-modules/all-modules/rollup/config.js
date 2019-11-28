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
    'enterprise-es-dev': {
        entry: path.resolve(__dirname, './main.js'),
        dest: path.resolve(__dirname, '../dist/ag-grid-enterprise.esm.js'),
        format: 'es',
        env: 'development',
        banner
    },
    'enterprise-es-prod': {
        entry: path.resolve(__dirname, './main.js'),
        dest: path.resolve(__dirname, '../dist/ag-grid-enterprise.esm.min.js'),
        format: 'es',
        env: 'production',
        banner
    },
    'enterprise-cjs-dev': {
        entry: path.resolve(__dirname, './main.js'),
        dest: path.resolve(__dirname, '../dist/ag-grid-enterprise.cjs.js'),
        format: 'cjs',
        env: 'development',
        banner
    },
    'enterprise-cjs-prod': {
        entry: path.resolve(__dirname, './main.js'),
        dest: path.resolve(__dirname, '../dist/ag-grid-enterprise.cjs.min.js'),
        format: 'cjs',
        env: 'production',
        banner
    },
/*
    'enterprise-umd-noStyle-dev': {
        entry: path.resolve(__dirname, './main.js'),
        dest: path.resolve(__dirname, '../dist/ag-grid-enterprise.noStyle.js'),
        format: 'umd',
        env: 'development',
        moduleName: 'agGrid',
        banner
    },
    'enterprise-umd-noStyle-prod': {
        entry: path.resolve(__dirname, './main.js'),
        dest: path.resolve(__dirname, '../dist/ag-grid-enterprise.min.noStyle.js'),
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
        external: opts.external,
        plugins: [
            node()      // for utils package - defaulting to use index.js
        ].concat(opts.plugins || []),
        output: {
            file: opts.dest,
            format: opts.format,
            banner: opts.banner,
            name: opts.moduleName || 'Vue'
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
exports.getAllBuilds = () => Object.keys(builds).map(genConfig)
