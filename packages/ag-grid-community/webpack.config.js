const { join } = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const postcss = require('postcss');
const cssAutoPrefix = require('autoprefixer');
const cssNano = require('cssnano');
const cssImport = require('postcss-import');
const cssRtl = require('postcss-rtlcss');
const cssUrl = require('postcss-url');

const postcssPlugins = [
    cssImport(),
    cssUrl({ url: 'inline' }),
    cssAutoPrefix(),
    cssRtl({
        ltrPrefix: ':where(.ag-ltr)',
        rtlPrefix: ':where(.ag-rtl)',
        bothPrefix: ':where(.ag-ltr, .ag-rtl)',
    }),
    cssNano({
        preset: [
            'default',
            {
                discardComments: true,
                normalizeWhitespace: true,
                minifySelectors: true,
            },
        ],
    }),
];

module.exports = ({ production = false, minify = false, styles = 'true', entry = './src/main-umd-styles.ts' }) => {
    styles = styles !== 'false';

    const filename = `ag-grid-community${minify ? '.min' : ''}${styles ? '' : '.noStyle'}.js`;

    console.log(`filename: ${filename}, minify: ${minify}, styles: ${styles}, entry: ${entry}`);

    const rules = [];
    if (!production) {
        // source map loader for dev
        rules.push({
            test: /\.cjs.js$/,
            enforce: 'pre',
            use: ['source-map-loader'],
        });

        rules.push({
            test: /\.tsx?$/,
            loader: 'esbuild-loader',
            exclude: /node_modules/,
            options: {
                tsconfig: join(__dirname, 'tsconfig.lib.json'),
            },
        });
    } else {
        rules.push({
            test: /\.tsx?$/,
            loader: require.resolve('ts-loader'),
            exclude: /node_modules/,
            options: {
                configFile: join(__dirname, 'tsconfig.lib.json'),
            },
        });
    }

    // Source CSS (packages/*/src/**/*.css) → processed text string (default export)
    rules.push({
        test: /\.css$/,
        include: [join(__dirname, 'src')],
        type: 'asset/source',
        use: [{ loader: 'postcss-loader', options: { postcssOptions: { plugins: postcssPlugins } } }],
    });

    if (styles) {
        // Legacy theme CSS (@ag-grid-community/styles/*.css) → injected as <style> tags
        rules.push({
            test: /\.css$/,
            exclude: [join(__dirname, 'src')],
            use: [
                {
                    loader: 'style-loader',
                    options: {
                        attributes: {
                            'data-ag-scope': 'legacy',
                        },
                    },
                },
                'css-loader',
                { loader: 'postcss-loader', options: { postcssOptions: { plugins: postcssPlugins } } },
            ],
        });
    }

    return {
        mode: production ? 'production' : 'development',
        devtool: production ? false : 'inline-source-map',
        entry: join(__dirname, entry),
        ignoreWarnings: [(warning) => true],
        output: {
            path: join(__dirname, 'dist'),
            filename,
            library: 'agGrid',
            libraryTarget: 'umd',
        },
        module: {
            rules,
        },
        resolve: {
            extensions: ['.js', '.jsx', '.tsx', '.ts', '.html', '.scss'],
            modules: ['node_modules'],
        },
        optimization: {
            minimizer: !!minify
                ? [
                      new TerserPlugin({
                          terserOptions: {
                              output: {
                                  comments: false,
                              },
                          },
                          extractComments: false,
                      }),
                  ]
                : [],
        },
    };
};
