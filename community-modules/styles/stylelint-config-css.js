module.exports = {
    plugins: ['stylelint-csstree-validator'],
    rules: {
        'csstree/validator': {
            ignoreProperties: ['container-type'],
            ignoreValue: /\bmax\(/,
        },
    },
};
