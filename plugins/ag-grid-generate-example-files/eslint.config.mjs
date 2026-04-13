import rootESLint from '../../eslint.config.mjs';

export default [
    ...rootESLint,
    {
        rules: {
            '@typescript-eslint/no-unsafe-function-type': 'error',
            '@typescript-eslint/no-wrapper-object-types': 'error',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_+$',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/no-var-requires': 'error',
            '@typescript-eslint/prefer-as-const': 'error',
            '@typescript-eslint/ban-ts-comment': 'error',
            'prefer-const': ['error', { destructuring: 'all' }],
            'no-useless-escape': 'error',
            'prefer-spread': 'error',
        },
    },
    {
        ignores: ['**/*.d.ts', 'packages/**'],
    },
];
