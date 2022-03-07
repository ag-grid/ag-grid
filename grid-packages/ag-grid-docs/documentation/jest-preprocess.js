const babelPresetGatsby = require('babel-preset-gatsby');

const babelOptions = {
    presets: [babelPresetGatsby, '@babel/preset-typescript'],
};

module.exports = require('babel-jest').createTransformer(babelOptions);