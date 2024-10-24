import rootESLint from '../../eslint.config.mjs';

export default [
    ...rootESLint,
    {
        rules: {
            '@typescript-eslint/no-var-requires': 'error',
            '@typescript-eslint/no-unused-vars': 'error',

            // todo: enable this rule
            'dot-notation': 'off',
        },
    },
];
