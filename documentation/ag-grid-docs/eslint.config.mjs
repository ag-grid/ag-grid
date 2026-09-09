import reactHooksPlugin from 'eslint-plugin-react-hooks';

import rootESLint from '../../eslint.config.mjs';
import { noRawHistoryWrites } from '../../external/ag-website-shared/eslint.history-rules.mjs';

export default [
    ...rootESLint,
    {
        plugins: {
            'react-hooks': reactHooksPlugin,
        },
        rules: reactHooksPlugin.configs.recommended.rules,
    },
    {
        ignores: [
            '.astro/',
            'packages/', // gitignored copy of built grid packages, served to local examples
            '**/_examples/',
            'scripts/showcase-github/tmp/',
            '**/.angular',
            '.playwright-network-cache/',
            '**/*.ics',
            'public/**/*.css',
        ],
    },
    {
        rules: {
            'no-eval': 'error',
            'no-console': 'error',
            'import-x/consistent-type-specifier-style': 'off',
        },
    },
    {
        files: ['*-boilerplate/*'],
        env: {
            es6: true,
        },
    },
    // Test files
    {
        files: ['**/*.test.ts'],
        languageOptions: {
            globals: {
                describe: 'readonly',
                it: 'readonly',
                expect: 'readonly',
                test: 'readonly',
                vi: 'readonly',
            },
        },
    },
    // Public files
    {
        files: ['public/**/*[.js|.ts]'],
        rules: {
            '@typescript-eslint/no-unused-vars': 'off',
            'no-console': 'off',
        },
    },
    // env.d.ts
    {
        files: ['src/env.d.ts'],
        rules: {
            '@typescript-eslint/triple-slash-reference': 'off',
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
    {
        rules: {
            'no-restricted-syntax': ['error', ...noRawHistoryWrites],
        },
    },
];
