const babelPresetGatsby = require('babel-preset-gatsby');

const babelOptions = {
    presets: [babelPresetGatsby],
};

module.exports = require('babel-jest').createTransformer(babelOptions);