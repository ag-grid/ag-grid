import rootESLint from '../../eslint.config.mjs';
import { noGuessedDelays } from '../shared/eslint/rules.mjs';

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
            // The remaining legitimate waits carry documented `eslint-disable` comments naming the
            // product timer window they wait on.
            'no-restricted-syntax': noGuessedDelays,
        },
    },
    {
        // The timestamp file is Vite's, written beside the config for the length of a run and outside every
        // tsconfig, so linting it errors. A concurrent `./checks.sh` would otherwise fail on someone else's run.
        ignores: ['src/benchmarks/bench-compare.mjs', 'eslint.config.mjs', 'vitest.config.*.timestamp*'],
    },
];
