const path = require('path');
const node = require('rollup-plugin-node-resolve');
const packageJson = require('./package.json');
const typescript = require('rollup-plugin-typescript2');
const alias = require('@rollup/plugin-alias');
const commonjs = require("rollup-plugin-commonjs");
const agChartsCommunity = require('ag-charts-community');
// const analyze = require('rollup-plugin-analyzer')

const banner = ['/**',
    ` * ${packageJson.name} - ${packageJson.description}` +
    ` * @version v${packageJson.version}`,
    ` * @link ${packageJson.homepage}`,
    `' * @license ${packageJson.license}`,
    ' */',
    ''].join('\n');

const builds = {
    'enterprise-cjs-dev': {
        entry: path.resolve(__dirname, './src/main.ts'),
        dest: path.resolve(__dirname, './dist/ag-grid-enterprise.cjs.js'),
        format: 'cjs',
        env: 'development',
        nodeFormatOverride: 'es5-cjs',
        banner
    },
    'enterprise-cjs-prod': {
        entry: path.resolve(__dirname, './src/main.ts'),
        dest: path.resolve(__dirname, './dist/ag-grid-enterprise.cjs.min.js'),
        format: 'cjs',
        env: 'production',
        nodeFormatOverride: 'es5-cjs',
        banner
    },
    'enterprise-esm-dev': {
        entry: path.resolve(__dirname, './src/main.ts'),
        dest: path.resolve(__dirname, './dist/ag-grid-enterprise.esm.js'),
        format: 'esm',
        env: 'development',
        banner
    },
    'enterprise-esm-prod': {
        entry: path.resolve(__dirname, './src/main.ts'),
        dest: path.resolve(__dirname, './dist/ag-grid-enterprise.esm.min.js'),
        format: 'esm',
        env: 'production',
        banner
    },
    'enterprise-charts-cjs-dev': {
        entry: path.resolve(__dirname, './src/main-charts.ts'),
        dest: path.resolve(__dirname, './dist/ag-grid-charts-enterprise.cjs.js'),
        format: 'cjs',
        env: 'development',
        nodeFormatOverride: 'es5-cjs',
        banner
    },
    'enterprise-charts-cjs-prod': {
        entry: path.resolve(__dirname, './src/main-charts.ts'),
        dest: path.resolve(__dirname, './dist/ag-grid-charts-enterprise.cjs.min.js'),
        format: 'cjs',
        env: 'production',
        nodeFormatOverride: 'es5-cjs',
        banner
    },
    'enterprise-charts-esm-dev': {
        entry: path.resolve(__dirname, './src/main-charts.ts'),
        dest: path.resolve(__dirname, './dist/ag-grid-charts-enterprise.esm.js'),
        format: 'esm',
        env: 'development',
        banner
    },
    'enterprise-charts-esm-prod': {
        entry: path.resolve(__dirname, './src/main-charts.ts'),
        dest: path.resolve(__dirname, './dist/ag-grid-charts-enterprise.esm.min.js'),
        format: 'esm',
        env: 'production',
        banner
    }
};

function genConfig(name) {
    const opts = builds[name];
    const config = {
        input: opts.entry,
        external: ['ag-grid-community'],
        plugins: [
            // The order of plugins is VERY important here. Do not change unless you know what you're doing
            alias({
                resolve: ['', '.js'],
                entries: [
                    {find: '@ag-grid-community/core', replacement: 'ag-grid-community'}
                ]
            }),
            node({dedupe: ['ag-charts-community'], format: opts.nodeFormatOverride }),      // for utils package - defaulting to use index.js
            commonjs({
                namedExports: {
                    '../../grid-enterprise-modules/charts/node_modules/ag-charts-enterprise/dist/package/main.cjs.js' : Object.keys(agChartsCommunity)
                }
            }),
            typescript({
                tsconfig: "tsconfig.es6.json"
            }),
            // analyze({summaryOnly: true}),
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
