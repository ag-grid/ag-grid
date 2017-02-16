module.exports = {
    entry: "./main-with-styles.js",
    output: {
        path: __dirname + "/dist",
        library: ["agGrid"],
        libraryTarget: "umd",
        filename: "ag-grid.js"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style-loader!css-loader" }
        ]
    }
};