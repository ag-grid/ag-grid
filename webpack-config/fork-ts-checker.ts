const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const path = require('path');

module.exports = function() {
    return {
        apply: function() {}
    };

    return new ForkTsCheckerWebpackPlugin({
        tsconfig: path.resolve(__dirname, '../tsconfig.json'),
        watch: '_dev',
        checkSyntacticErrors: true
    });
};
