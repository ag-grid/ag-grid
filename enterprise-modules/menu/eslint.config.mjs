import rootESLint from '../../eslint.config.mjs';

export default [
    ...rootESLint,
    {
        ignores: ['dist/'],
    },
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-var-requires': 'warn',
            'prefer-const': 'warn',
            '@typescript-eslint/prefer-as-const': 'warn',
            'no-case-declarations': 'warn',
            'no-extra-boolean-cast': 'warn',
        },
    },
];
