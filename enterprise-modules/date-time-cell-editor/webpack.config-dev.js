const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',

    // output: {
    //     libraryTarget: 'commonjs'
    // },
    entry: './src/dev.ts',

    resolve: {
        extensions: ['.ts', '.js', '.scss'],
        // modules: [
        //     path.resolve(__dirname, 'src'),
        //     'node_modules'
        // ],
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                use: ['source-map-loader'],
                enforce: 'pre',
            },
            {
                test: /\.ts$/,
                exclude: [/node_modules/],
                use: 'awesome-typescript-loader',
            },
            {
                test: /\.scss$/i,
                use: [
                    // Creates `style` nodes from JS strings
                    'style-loader',
                    // Translates CSS into CommonJS
                    'css-loader',
                    // Compiles Sass to CSS
                    'sass-loader',
                ],
            },
        ],
    },

    plugins: [
        new HtmlWebpackPlugin({
            // filename: 'index.html'
        }),
    ],

    devtool: 'inline-source-map',
};
