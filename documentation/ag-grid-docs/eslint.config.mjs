import rootESLint from '../../eslint.config.mjs';

export default [
    ...rootESLint,
    {
        ignores: ['.astro/', '**/_examples/'],
    },
    {
        rules: {
            'no-eval': 'error',
            'no-console': 'warn',
            'prefer-const': 'warn',
            'no-undef': 'warn',
            'no-constant-condition': 'warn',
            'no-prototype-builtins': 'warn',
            '@typescript-eslint/no-unused-vars': 'warn',
            '@typescript-eslint/no-non-null-asserted-optional-chain': 'warn',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-this-alias': 'warn',
            '@typescript-eslint/ban-types': 'warn',
            '@typescript-eslint/ban-ts-comment': 'warn',
            '@typescript-eslint/triple-slash-reference': 'warn',
        },
    },
    {
        files: ['*-boilerplate/*'],
        env: {
            es6: true,
        },
    },
    // Root scripts
    {
        files: ['*.mjs', '*.cjs', 'markdoc.config.ts'],
        rules: {
            'no-console': 'off',
            '@typescript-eslint/no-var-requires': 'off',
        },
    },
];
