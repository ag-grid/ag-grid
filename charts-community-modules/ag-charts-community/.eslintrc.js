// eslint-disable-next-line no-undef
module.exports = {
    env: {
        browser: true,
        es6: true,
    },
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/eslint-recommended'],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint'],
    rules: {
        'no-console': 2,
        'no-unused-vars': 0, // Handled by TS strict flag.
        'no-case-declarations': 0,
    },
    overrides: [
        {
            files: ['**/*.test.ts'],
            rules: {
                'no-console': 0,
            },
        },
    ],
};
