import rootESLint, { sonarjsConfig } from '../../eslint.config.mjs';

export default [
    ...rootESLint,
    ...sonarjsConfig,
    {
        rules: {
            'no-empty': 'error',
            'prefer-const': ['error', { destructuring: 'all' }],
            'no-useless-escape': 'error',
            'no-extra-boolean-cast': 'error',
            '@typescript-eslint/no-unused-vars': 'error',
            '@typescript-eslint/no-unsafe-function-type': 'error',
            '@typescript-eslint/no-wrapper-object-types': 'error',
            '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'with-single-extends' }],
            '@typescript-eslint/no-var-requires': 'error',
            'no-console': 'error',
        },
    },
];
