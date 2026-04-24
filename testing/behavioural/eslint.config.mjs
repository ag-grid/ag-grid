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
            '@typescript-eslint/no-floating-promises': 2,
            'no-unassigned-vars': 0,
            'no-useless-assignment': 0,
        },
    },
    {
        ignores: ['src/benchmarks/bench-compare.mjs', 'eslint.config.mjs'],
    },
];
