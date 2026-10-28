import noMismatchedGenericArgs from '../../eslint-rules/no-mismatched-generic-args.mjs';
import rootESLint, { sonarjsConfig } from '../../eslint.config.mjs';

export default [
    ...rootESLint,
    ...sonarjsConfig,
    {
        rules: {
            'prefer-rest-params': 'error',
            'no-extra-boolean-cast': 'error',
            '@typescript-eslint/no-unused-vars': 'error',
            '@typescript-eslint/no-this-alias': 'off',
            'no-console': 'error',
        },
    },
    {
        ignores: ['updateGridAndColumnProperties.cjs', 'eslint.config.mjs', 'vite.config.d.ts'],
    },
    {
        files: ['src/**/*.ts'],
        plugins: { ag: { rules: { 'no-mismatched-generic-args': noMismatchedGenericArgs } } },
        languageOptions: {
            parserOptions: {
                project: ['./tsconfig.app.json'],
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            'ag/no-mismatched-generic-args': 'error',
        },
    },
];
