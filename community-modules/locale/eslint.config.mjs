import rootESLint from '../../eslint.config.mjs';

export default [
    ...rootESLint,
    {
        rules: {
            'no-restricted-imports': 'error',
            'no-fallthrough': 'error',
            'no-case-declarations': 'error',
            'no-prototype-builtins': 'error',
            'no-unexpected-multiline': 'error',
            'no-useless-escape': 'error',
            'prefer-spread': 'error',
            'no-irregular-whitespace': 'error',
            '@typescript-eslint/ban-types': 'error',
            '@typescript-eslint/no-unused-vars': 'error',
            'prefer-const': ['error', { destructuring: 'all' }],
            'prefer-rest-params': 'error',
            '@typescript-eslint/no-var-requires': 'error',
            '@typescript-eslint/prefer-as-const': 'error',
            '@typescript-eslint/ban-ts-comment': 'error',
            '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
            '@typescript-eslint/no-unnecessary-type-constraint': 'error',
            '@typescript-eslint/no-this-alias': 'error',
        },
    },
];
