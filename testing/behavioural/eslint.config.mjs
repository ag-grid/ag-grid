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
            // The backlog is swept (AG-18026), so this is now an `error`: a new guessed delay fails
            // the build. The remaining legitimate waits carry documented `eslint-disable` comments
            // naming the product timer window they wait on.
            'no-restricted-syntax': [
                'error',
                {
                    selector: "CallExpression[callee.name='asyncSetTimeout'] > Literal[value>0]",
                    message:
                        'Guessed delay. Poll with waitFor, or drop the sleep if the next call already polls. asyncSetTimeout(0) is allowed; (1) is identical to (0) in Node. A genuine timer window needs an eslint-disable naming it. See .rulesync/rules/testing.md.',
                },
            ],
        },
    },
    {
        ignores: ['src/benchmarks/bench-compare.mjs', 'eslint.config.mjs'],
    },
];
