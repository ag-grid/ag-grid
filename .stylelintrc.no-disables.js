// Rules in this config run with disable comments ignored, so they cannot be
// circumvented from inside a CSS file. It runs alongside .stylelintrc.js in
// each package's lint target.
module.exports = {
    plugins: ['./plugins/stylelint-plugin-ag/index.mjs'],
    ignoreDisables: true,
    rules: {
        'ag/no-block-disables': true,
    },
};
