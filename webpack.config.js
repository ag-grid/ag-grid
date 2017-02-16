module.exports = {
    entry: "./webpack-with-styles.js",
    output: {
        path: __dirname + "/dist",
        library: ["agGrid"],
        libraryTarget: "umd",
        filename: "ag-grid-enterprise.js"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style-loader!css-loader" }
        ]
    }
};