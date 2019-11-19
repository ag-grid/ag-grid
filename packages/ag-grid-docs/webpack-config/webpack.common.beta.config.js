const path = require('path');

module.exports = {
    mode: 'development',
    devtool: 'inline-source-map',
    externals: {
        angular: 'angular',
        react: 'react',
        'react-dom': 'react-dom'
    },
    resolve: {
        // we prioritise main (cjs) vs module (es6) as when doing dev we only rebuild cjs for performance reasons
        alias: {
            "@ag-grid-community/core": path.resolve(__dirname, "../../../community-modules/grid-core/src/ts/main.ts")
        },
        extensions: [".ts", ".tsx", ".js"]
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true,
                            experimentalWatchApi: true
                        },
                    },
                ],
            },
            {
                test: /\.js$/,
                use: ["source-map-loader"],
                enforce: "pre"
            },
            {
                test: /\.css$/,
                loader: "style-loader!css-loader"
            },
            {
                test: /\.(svg)$/,
                use: [
                    {loader: 'url-loader', options: {limit: 20000}}
                ]
            }
        ]
    },
    watchOptions: {
        ignored: [/node_modules/]
    },
    optimization: {
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
    }
};
