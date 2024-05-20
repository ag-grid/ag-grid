import rootESLint from '../../eslint.config.mjs';

export default [
    ...rootESLint,
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/ban-types': 'warn',
            '@typescript-eslint/no-unused-vars': 'warn',
            '@typescript-eslint/no-var-requires': 'warn',
            '@typescript-eslint/prefer-as-const': 'warn',
            '@typescript-eslint/ban-ts-comment': 'warn',
            'prefer-const': 'warn',
            'no-useless-escape': 'warn',
            'prefer-spread': 'warn',
        },
    },
];
