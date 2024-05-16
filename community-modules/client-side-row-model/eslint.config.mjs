import rootESLint from '../../eslint.config.mjs';

export default [
    ...rootESLint,
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            'no-fallthrough': 'warn',
            '@typescript-eslint/ban-types': 'warn',
            '@typescript-eslint/no-unused-vars': 'warn',
            'prefer-const': 'warn',
        },
    },
];
