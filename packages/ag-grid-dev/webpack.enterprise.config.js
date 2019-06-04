const merge = require('webpack-merge');

const baseConfig = require('./webpack.common.config');

module.exports = merge(baseConfig, {
    entry: {
        'enterprise': './enterprise.ts'
    }
});
