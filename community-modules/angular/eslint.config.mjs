import rootESLint from '../../eslint.config.mjs';

export default [
    ...rootESLint,
    {
        ignores: ['.angular/'],
    },
    {
        rules: {
            '@typescript-eslint/ban-types': 'warn',
            '@typescript-eslint/no-this-alias': 'warn',
            '@typescript-eslint/no-var-requires': 'warn',
            '@typescript-eslint/no-unused-vars': 'warn',
            'no-undef': 'warn',
        },
    },
    {
        files: ['projects/ag-grid-angular/src/**'],
        rules: {
            '@typescript-eslint/consistent-type-imports': 'off',
        },
    },
];
