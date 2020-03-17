const path = require('path');
const node = require('rollup-plugin-node-resolve');
const packageJson = require('./package.json');
const typescript = require('rollup-plugin-typescript2');

const banner = ['/**',
    ` * ${ packageJson.name } - ${ packageJson.description }` +
    ` * @version v${ packageJson.version }`,
    ` * @link ${ packageJson.homepage }`,
    `' * @license ${ packageJson.license }`,
    ' */',
    ''].join('\n');

const builds = {
    'community-cjs-dev': {
        entry: path.resolve(__dirname, './src/main.ts'),
        dest: path.resolve(__dirname, './dist/ag-grid-community.cjs.js'),
        format: 'cjs',
        env: 'development',
        banner
    },
/*    'community-cjs-prod': {
        entry: path.resolve(__dirname, '../dist/es6/main.js'),
        dest: path.resolve(__dirname, '../dist/ag-grid-community.cjs.min.js'),
        format: 'cjs',
        env: 'production',
        banner
    }*/
};

function genConfig(name) {
    const opts = builds[name];
    const config = {
        input: opts.entry,
        plugins: [
            node(),      // for utils package - defaulting to use index.js
            typescript({
                tsconfig: "tsconfig.es6.json"
            })
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
