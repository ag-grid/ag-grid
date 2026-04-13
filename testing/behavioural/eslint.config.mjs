import rootESLint from '../../eslint.config.mjs';

export default [
    ...rootESLint,
    {
        languageOptions: {
            parserOptions: {
                project: './tsconfig.spec.json',
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            'no-undef': 0,
            '@typescript-eslint/no-var-requires': 0,
            '@typescript-eslint/no-unsafe-function-type': 0,
            '@typescript-eslint/no-floating-promises': 2,
        },
    },
    {
        ignores: ['eslint.config.mjs'],
    },
];
