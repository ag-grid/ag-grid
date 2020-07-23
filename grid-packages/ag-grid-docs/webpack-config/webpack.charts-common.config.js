const path = require('path');
// as we're watch the ts files separately (or the FW examples, no need to report TS errors here too)
// const ForkTsCheckerNotifierWebpackPlugin = require('fork-ts-checker-notifier-webpack-plugin');
// const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
    mode: 'development',
    devtool: 'inline-source-map',
    externals: {
        angular: 'angular',
        react: 'react',
        'react-dom': 'react-dom'
    },
    // as we're watch the ts files separately (or the FW examples, no need to report TS errors here too)
    // plugins: [
    //     new ForkTsCheckerWebpackPlugin({
    //         eslint: true
    //     }),
    //     new ForkTsCheckerNotifierWebpackPlugin({title: 'TypeScript', excludeWarnings: false}),
    // ],
    resolve: {
        // favour cjs over es6 (docs only rebuilds cjs...)
        mainFields: ["main", "module"],
        // alias: {
        //     "@ag-grid-community/core": path.resolve(__dirname, "../../../community-modules/core/src/ts/main.ts")
        // },
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
                            transpileOnly: true
                        },
                    },
                ],
            },
            {
                test: /\.js$/,
                use: ["source-map-loader"],
                enforce: "pre"
            }/*,
            {
                test: /\.css$/,
                loader: "style-loader!css-loader"
            },
            {
                test: /\.(svg)$/,
                use: [
                    {loader: 'url-loader', options: {limit: 20000}}
                ]
            }*/
        ]
    },
    watchOptions: {
        ignored: [/node_modules/, '/dist/']
    },
    optimization: {
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
    }
};
