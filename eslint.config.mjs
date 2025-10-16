import pluginJs from '@eslint/js';
import eslintImportX from 'eslint-plugin-import-x';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export const sonarjsConfig = [
    sonarjs.configs.recommended,
    {
        files: ['**/*.{js,ts,tsx}'],
        rules: {
            // The plan is to work through these rules and enable them where possible.
            // For now, turning them off to avoid noise and enable other sonarjs rules.
            'sonarjs/no-duplicate-string': 0,
            'sonarjs/sonar-max-params': 0,
            'sonarjs/todo-tag': 0,
            'sonarjs/fixme-tag': 0,
            'sonarjs/no-redeclare': 0,
            'sonarjs/function-return-type': 0,
            'sonarjs/max-switch-cases': 0,

            'sonarjs/different-types-comparison': 0,
            'sonarjs/slow-regex': 0,
            'sonarjs/no-selector-parameter': 0,
            'sonarjs/redundant-type-aliases': 0,
            'sonarjs/new-cap': 0,
            'sonarjs/deprecation': 0,
            'sonarjs/cognitive-complexity': 0,
            'sonarjs/class-name': 0,
            'sonarjs/no-nested-functions': 0,
            'sonarjs/no-nested-conditional': 0,
            'sonarjs/pseudo-random': 0,
            'sonarjs/public-static-readonly': 0,
            'sonarjs/no-redundant-optional': 1,
            'sonarjs/no-ignored-exceptions': 0,
            'sonarjs/no-alphabetical-sort': 0,
            'sonarjs/no-redundant-boolean': 0,
            'sonarjs/no-async-constructor': 0,
            'sonarjs/updated-loop-counter': 0,
            'sonarjs/no-unused-vars': 0,
            'sonarjs/no-misleading-array-reverse': 0,
            'sonarjs/no-useless-intersection': 0,
            'sonarjs/no-nested-assignment': 0,
            'sonarjs/prefer-regexp-exec': 0,
            'sonarjs/concise-regex': 0,

            // Duplicates @typescript-eslint
            'sonarjs/sonar-no-unused-vars': 0,
            'sonarjs/no-redundant-type-constituents': 0,
            'sonarjs/no-base-to-string': 0,
            'sonarjs/no-misused-promises': 0,
            'sonarjs/no-fallthrough': 0,

            // Unicorn rules, as referenced from the SonarCloud documentation.
            // 'unicorn/prefer-number-properties': 1,
            // 'unicorn/prefer-modern-dom-apis': 1,
            // 'unicorn/no-array-for-each': 1,
            'unicorn/prefer-export-from': 0,
            'unicorn/prefer-dom-node-remove': 1,
            'unicorn/prefer-math-trunc': 0,
            'unicorn/prefer-at': 0,
            'unicorn/prefer-includes': 0,
            'unicorn/no-zero-fractions': 0,
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
            'no-duplicate-imports': ['error', { allowSeparateTypeImports: true }],
            '@typescript-eslint/no-this-alias': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_+$',
                },
            ],
            'no-undef': 'warn',
            'no-lonely-if': 'error',
            curly: 'error',
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
