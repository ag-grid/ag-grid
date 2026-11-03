import noMismatchedGenericArgs from '../../eslint-rules/no-mismatched-generic-args.mjs';
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
            '@typescript-eslint/no-var-requires': 'error',
            'no-console': 'error',
        },
    },
    {
        files: ['src/**/*.ts', 'src/**/*.tsx'],
        plugins: { ag: { rules: { 'no-mismatched-generic-args': noMismatchedGenericArgs } } },
        languageOptions: {
            parserOptions: {
                project: ['./tsconfig.lib.json', './tsconfig.spec.json'],
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            'ag/no-mismatched-generic-args': 'error',
        },
    },
];
