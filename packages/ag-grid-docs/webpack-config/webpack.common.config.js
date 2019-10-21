const autoprefixer = require('autoprefixer');
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
            // "@ag-community/grid-core": path.resolve(__dirname, "../../../community-modules/grid-core/src/ts/main.ts")
            "@ag-community/grid-core": path.resolve(__dirname, "../_dev/@ag-community/grid-core")
        },
        extensions: ['.js']
        // extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            // {
            //     test: /\.ts$/,
            //     use: [
            //         {loader: 'cache-loader'},
            //         {
            //             loader: 'thread-loader',
            //             options: {
            //                 workers: require('os').cpus().length - 1
            //             }
            //         },
            //         {
            //             loader: 'ts-loader',
            //             options: {
            //                 happyPackMode: true,
            //                 configFile: path.resolve('./tsconfig.json')
            //             }
            //         }
            //     ]
            // },
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    {loader: 'css-loader', options: {sourceMap: true}},
                    {
                        loader: 'postcss-loader',
                        options: {
                            sourceMap: true,
                            syntax: 'postcss-scss',
                            plugins: [autoprefixer({
                                overrideBrowserslist: ["last 2 version"],
                                flexbox: true
                            })]
                        }
                    },
                    {loader: 'sass-loader', options: {sourceMap: true}}
                ]
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
