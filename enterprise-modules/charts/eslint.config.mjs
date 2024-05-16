import rootESLint from '../../eslint.config.mjs';

export default [
    ...rootESLint,
    {
        ignores: ['dist/'],
    },
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            'prefer-const': 'warn',
            'no-prototype-builtins': 'warn',
            'no-case-declarations': 'warn',
            'no-fallthrough': 'warn',
            '@typescript-eslint/ban-ts-comment': 'warn',
            '@typescript-eslint/no-var-requires': 'warn',
            '@typescript-eslint/no-unused-vars': 'warn',
            '@typescript-eslint/ban-types': 'warn',
        },
    },
];
