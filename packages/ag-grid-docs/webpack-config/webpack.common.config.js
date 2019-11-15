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
        mainFields: ["main", "module"],
        alias: {
            "@ag-grid-community/grid-core": path.resolve(__dirname, "../_dev/@ag-grid-community/grid-core")
        },
        extensions: ['.js']
    },
    module: {
        rules: [
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
    }
};
