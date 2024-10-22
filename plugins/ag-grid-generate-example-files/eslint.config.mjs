import rootESLint from '../../eslint.config.mjs';

export default [
    ...rootESLint,
    {
        rules: {
            '@typescript-eslint/ban-types': 'error',
            '@typescript-eslint/no-unused-vars': 'error',
            '@typescript-eslint/no-var-requires': 'error',
            '@typescript-eslint/prefer-as-const': 'error',
            '@typescript-eslint/ban-ts-comment': 'error',
            'prefer-const': ['error', { destructuring: 'all' }],
            'no-useless-escape': 'error',
            'prefer-spread': 'error',
        },
    },
];
