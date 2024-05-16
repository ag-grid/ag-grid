import rootESLint from '../../eslint.config.mjs';

export default [
    ...rootESLint,
    {
        ignores: ['dist/'],
    },
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': 'warn',
            '@typescript-eslint/prefer-as-const': 'warn',
            'prefer-const': 'warn',
            'no-cond-assign': 'warn',
        },
    },
];
