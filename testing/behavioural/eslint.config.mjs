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
            // Severity is `warn` while the existing backlog is swept (AG-18026); it becomes `error`
            // once the sweep completes.
            'no-restricted-syntax': [
                'warn',
                {
                    selector: "CallExpression[callee.name='asyncSetTimeout'] > Literal[value>0]",
                    message:
                        'Do not guess how long an async grid update takes. Poll the condition with `waitFor` instead, or delete the sleep if the next call already polls. `asyncSetTimeout(0)` is allowed for a single-tick yield — note that (1) is identical to (0) in Node, so it buys nothing. A genuine timer window needs an eslint-disable naming the window. See .rulesync/rules/testing.md → Waiting for Async Grid Updates.',
                },
            ],
        },
    },
    {
        ignores: ['src/benchmarks/bench-compare.mjs', 'eslint.config.mjs'],
    },
];
