// const { NxWebpackPlugin } = require('@nx/webpack');
const {join, resolve} = require('path');

const minify = false;
module.exports = {
    mode: "development",
    devtool: false,
    entry: join(__dirname, '/src/main-umd.ts'),
    output: {
        path: join(__dirname, 'dist'),
        filename: 'ag-grid-charts-enterprise.js',
        library: "agGrid",
        libraryTarget: "umd"
    },
    resolve: {
        alias: {
            '@ag-grid-community/core': resolve(__dirname, '../../node_modules/@ag-grid-community/core'),
        }
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                // use: 'ts-loader',
                loader: require.resolve('ts-loader'),
                exclude: /node_modules/,
                options: {
                    configFile: join(__dirname, 'tsconfig.lib.json'),
                }
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ].concat(
                    !!minify ?
                        {
                            loader: 'postcss-loader',
                            options: {
                                ident: 'postcss',
                                plugins: () => [
                                    require('cssnano')({
                                        preset: ['default', {
                                            convertValues: false,
                                            discardComments: {
                                                removeAll: true,
                                            },
                                        }]
                                    })
                                ]
                            }
                        } : []
                )
            }
        ],

    },
    // plugins: [
    //     new NxWebpackPlugin({
    //         main: './src/main.ts',
    //         tsConfig: './tsconfig.app.json',
    //         outputHashing: process.env['NODE_ENV'] === 'production' ? 'all' : 'none',
    //         optimization: process.env['NODE_ENV'] === 'production',
    //     }),
    // ],
    // module: {
    //     parser: {
    //         javascript: {
    //             reexportExportsPresence: false,
    //         },
    //     }
    // }
};
// module.exports = {
//     mode: 'development',
//     output: {
//         library: "agGrid",
//         libraryTarget: "umd"
//     }
// }
