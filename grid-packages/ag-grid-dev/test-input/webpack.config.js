const path = require('path');

const ROOT = path.resolve(__dirname, 'test-input');

module.exports = {
    mode: 'none',

    output: {
        libraryTarget: 'commonjs'
    },

    resolve: {
        extensions: ['.ts', '.js'],
        modules: [
            ROOT,
            'node_modules'
        ],
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                use: ["source-map-loader"],
                enforce: "pre"
            },
            {
                test: /\.ts$/,
                exclude: [/node_modules/],
                use: 'awesome-typescript-loader'
            }
        ]
    },

    devtool: 'inline-source-map'
};
