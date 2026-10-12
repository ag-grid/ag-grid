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
            '@typescript-eslint/no-floating-promises': 2,
        },
    },
    {
        ignores: ['eslint.config.mjs'],
    },
];
