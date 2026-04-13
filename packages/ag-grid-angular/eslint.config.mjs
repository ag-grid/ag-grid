import rootESLint, { sonarjsConfig } from '../../eslint.config.mjs';

export default [
    ...rootESLint,
    ...sonarjsConfig,
    {
        ignores: ['.angular/'],
    },
    {
        rules: {
            '@typescript-eslint/no-unsafe-function-type': 'error',
            '@typescript-eslint/no-wrapper-object-types': 'error',
            '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'with-single-extends' }],
            '@typescript-eslint/no-this-alias': 'off',
            '@typescript-eslint/no-var-requires': 'error',
            '@typescript-eslint/no-unused-vars': 'error',
            'no-console': 'error',
        },
    },
    {
        files: ['projects/ag-grid-angular/src/**'],
        rules: {
            '@typescript-eslint/consistent-type-imports': 'off',
        },
    },
];
