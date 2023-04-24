const path = require('path');
// as we're watch the ts files separately (or the FW examples, no need to report TS errors here too)

module.exports = {
    mode: 'development',
    devtool: 'inline-source-map',
    externals: {
        angular: 'angular',
        react: 'react',
        'react-dom': 'react-dom'
    },
    resolve: {
        // favour cjs over es6 (docs only rebuilds cjs...)
        mainFields: ["main", "module"],
        alias: {
            "@ag-grid-community/core": path.resolve(__dirname, "../../../grid-community-modules/core/src/ts/main.ts"),
            "ag-charts-community": path.resolve(__dirname, "../../../charts-community-modules/ag-charts-community/src/main.ts")
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
                            transpileOnly: true
                        },
                    },
                ],
            },
            {
                test: /\.js$/,
                use: ["source-map-loader"],
                enforce: "pre"
            }
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
