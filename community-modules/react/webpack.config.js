const path = require('path');

module.exports = {
    mode: 'development',
    entry: "./src/index.tsx",
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.(ts|js)x?$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            "@babel/preset-env",
                            "@babel/preset-react",
                            "@babel/preset-typescript",
                        ],
                    },
                },
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    output: {
        path: path.resolve(__dirname, "dev"),
        filename: "bundle.js",
    },
    devServer: {
        contentBase: path.join(__dirname, "dev-server"),
        compress: true,
        port: 4000
    },
};
