import reactHooksPlugin from 'eslint-plugin-react-hooks';

import rootESLint from '../../eslint.config.mjs';

export default [
    ...rootESLint,
    {
        plugins: {
            'react-hooks': reactHooksPlugin,
        },
        rules: reactHooksPlugin.configs.recommended.rules,
    },
    {
        ignores: ['.astro/', '**/_examples/', 'scripts/showcase-github/tmp/', '**/.angular'],
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
    // Example runner boilerplate files
    {
        files: ['public/example-runner/**/*[.js|.ts]'],
        languageOptions: {
            globals: {
                System: 'readonly',
                systemJsPaths: 'readonly',
                boilerplatePath: 'readonly',
                appLocation: 'readonly',
                systemJsMap: 'readonly',
            },
        },
    },
    // Public files
    {
        files: ['public/**/*[.js|.ts]'],
        rules: {
            '@typescript-eslint/no-unused-vars': 'warn',
            'no-console': 'warn',
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
];
