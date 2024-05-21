import rootESLint from '../../eslint.config.mjs';

export default [
    ...rootESLint,
    {
        rules: {
            '@typescript-eslint/no-unused-vars': 'warn',
            '@typescript-eslint/prefer-as-const': 'warn',
            'prefer-const': 'warn',
            'no-cond-assign': 'warn',
        },
    },
];
