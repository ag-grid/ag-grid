import pluginJs from '@eslint/js';
// import eslintImportX from 'eslint-plugin-import-x';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
    {
        // An `eslint-disable` whose rule no longer reports is a false claim about the code it
        // sits above, so it fails the build rather than warning. Restated here because this
        // config is standalone: it does not compose `@ag-studio/eslint`'s base.
        linterOptions: { reportUnusedDisableDirectives: 'error' },
        languageOptions: {
            globals: { ...globals.browser, ...globals.node },
            // Without it typescript-eslint infers the root, which fails once an editor loads several configs.
            parserOptions: { tsconfigRootDir: import.meta.dirname },
        },
    },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    // { plugins: { 'import-x': eslintImportX } },
    {
        ignores: ['node_modules/', 'dist/', '.astro/', '**/env.d.ts'],
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
            // 'import-x/consistent-type-specifier-style': 'error',
            '@typescript-eslint/no-this-alias': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_+$',
                },
            ],
            'no-undef': 'error',
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
