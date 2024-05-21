import rootESLint from '../../eslint.config.mjs';

export default [
    ...rootESLint,
    {
        rules: {
            '@typescript-eslint/no-unused-vars': 'warn',
            '@typescript-eslint/no-var-requires': 'warn',
            '@typescript-eslint/prefer-as-const': 'warn',
            '@typescript-eslint/ban-ts-comment': 'warn',
        },
    },
];
