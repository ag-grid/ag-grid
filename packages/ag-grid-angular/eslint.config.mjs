import noMismatchedGenericArgs from '../../eslint-rules/no-mismatched-generic-args.mjs';
import rootESLint, { sonarjsConfig } from '../../eslint.config.mjs';

export default [
    ...rootESLint,
    ...sonarjsConfig,
    {
        ignores: ['.angular/'],
    },
    {
        rules: {
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
    {
        files: ['projects/ag-grid-angular/src/**/*.ts'],
        plugins: { ag: { rules: { 'no-mismatched-generic-args': noMismatchedGenericArgs } } },
        languageOptions: {
            parserOptions: {
                project: [
                    './projects/ag-grid-angular/tsconfig.lib.json',
                    './projects/ag-grid-angular/tsconfig.spec.json',
                ],
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            'ag/no-mismatched-generic-args': 'error',
        },
    },
];
