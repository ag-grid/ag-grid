const merge = require('webpack-merge');
const common = require('./common');

const webpack = require('webpack');
const path = require('path');

let homepage = './src/_assets/ts/homepage';

if (require('minimist')(process.argv.slice(2)).hmr) {
    homepage = ['./src/_assets/ts/homepage', 'webpack-hot-middleware/client?path=/dist/__webpack_hmr&reload=true'];
}

module.exports = merge(common, {
    entry: {
        homepage: homepage
    },
    output: {
        publicPath: '/',
        hotUpdateChunkFilename: 'dist/[hash].hot-update.js',
        hotUpdateMainFilename: 'dist/[hash].hot-update.json'
    },

    plugins: [
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({ MAX_ACTIVE_EXAMPLES: JSON.stringify(3) })
    ]
});
