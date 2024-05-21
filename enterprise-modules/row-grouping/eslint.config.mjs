import rootESLint from '../../eslint.config.mjs';

export default [
    ...rootESLint,
    {
        rules: {
            'prefer-const': 'warn',
            'no-case-declarations': 'warn',
            '@typescript-eslint/no-unused-vars': 'warn',
        },
    },
];
