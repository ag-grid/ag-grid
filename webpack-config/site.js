const merge = require('webpack-merge');
const common = require('./common');

const webpack = require('webpack');
const path = require('path');

module.exports = merge(common, {
    entry: {
        site: './src/_assets/ts/site'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: 'http://localhost:3000/dist/'
    }
});
