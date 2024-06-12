import rootESLint from '../../eslint.config.mjs';

export default [
    ...rootESLint,
    {
        rules: {
            'import-x/consistent-type-specifier-style': 'off',
        },
    },
];
