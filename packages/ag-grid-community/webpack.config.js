const { join } = require('path');

const minify = false;
module.exports = {
    mode: "development",
    devtool: "inline-source-map",
    entry: join(__dirname, '/src/main-umd.ts'),
    output: {
        path: join(__dirname, 'dist'),
        filename: 'ag-grid-community.js',
        library: "agGrid",
        libraryTarget: "umd"
    },
    module: {
        rules: [
            {
                test: /\.cjs.js$/,
                enforce: "pre",
                use: ["source-map-loader"],
            },
            {
                test: /\.tsx?$/,
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

    }
};
