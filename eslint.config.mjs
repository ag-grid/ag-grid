import pluginJs from '@eslint/js';
import eslintImportX from 'eslint-plugin-import-x';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import tseslint from 'typescript-eslint';

let env = 'unknown';
// if (process.env.CI != null) {
//     env = 'ci';
// } else if (process.env.NX_TASK_TARGET_PROJECT != null) {
//     env = 'nx-task';
// }

export const sonarjsConfig = [
    sonarjs.configs.recommended,
    {
        files: ['**/*.{js,ts}'],
        rules: {
            // Show this warning in IDE and PRs, but not when running at command line (to reduce clutter).
            'sonarjs/cognitive-complexity': env !== 'nx-task' ? 1 : 0,
            'sonarjs/no-duplicate-string': env !== 'nx-task' ? 1 : 0,
            // 'sonarjs/sonar-max-params': env !== 'nx-task' ? 1 : 0,
            'sonarjs/todo-tag': env !== 'nx-task' ? 1 : 0,
            'sonarjs/fixme-tag': env !== 'nx-task' ? 1 : 0,
            // 'sonarjs/no-redeclare': env !== 'nx-task' ? 1 : 0,
            'sonarjs/function-return-type': env !== 'nx-task' ? 1 : 0,

            // We don't really care about these.
            'sonarjs/no-selector-parameter': 0,
            'sonarjs/redundant-type-aliases': 0,
            'sonarjs/new-cap': 0,

            // Duplicates @typescript-eslint
            'sonarjs/sonar-no-unused-vars': 0,
            'sonarjs/no-redundant-type-constituents': 0,
            'sonarjs/sonar-prefer-optional-chain': 0,
            'sonarjs/no-base-to-string': 0,
            'sonarjs/no-misused-promises': 0,

            // Unicorn rules, as referenced from the SonarCloud documentation.
            'unicorn/prefer-number-properties': 1,
            'unicorn/no-array-for-each': 1,
            'unicorn/prefer-export-from': 1,
            'unicorn/prefer-dom-node-remove': 1,
            'unicorn/prefer-math-trunc': 1,
            'unicorn/prefer-at': 1,
            'unicorn/prefer-global-this': 1,
            'unicorn/prefer-includes': 1,
            'unicorn/no-zero-fractions': 1,
        },
    },
];

export default [
    { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    { plugins: { 'import-x': eslintImportX, unicorn } },
    {
        ignores: ['node_modules/', 'dist/', '.astro/', '**/env.d.ts', 'coverage', '**/.dependency-cruiser.js'],
    },
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/consistent-type-imports': [
                'error',
                {
                    prefer: 'type-imports',
                    fixStyle: 'separate-type-imports',
                },
            ],
            'import-x/consistent-type-specifier-style': 'error',
            '@typescript-eslint/no-this-alias': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_+$',
                },
            ],
            'no-undef': 'warn',
        },
    },
    {
        // cypress uses a global API based on undefined variables
        files: [
            '**/*.spec.{ts,js}',
            '**/*test.{ts,js}',
            '**/{cypress,_copiedFromCore,__tests__}/**',
            '**/test-utils/**',
        ],
        rules: {
            'no-undef': 'off',
        },
    },
];
