import pluginJs from '@eslint/js';
// import eslintImportX from 'eslint-plugin-import-x';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
    { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
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
    {
        // Astro's ClientRouter stores its history index and scroll offsets in `history.state`.
        // A raw write replaces them, after which its popstate handler either bails out or reads
        // every traversal as a "back", silently breaking back/forward for the whole page.
        files: ['**/*.{ts,tsx}'],
        ignores: ['src/utils/historyUrl.ts'],
        rules: {
            'no-restricted-syntax': [
                'error',
                {
                    selector: 'CallExpression > MemberExpression.callee[property.name=/^(pushState|replaceState)$/]',
                    message:
                        'Use replaceHistoryUrl() from @ag-website-shared/utils/historyUrl - a raw history write discards the router state that back/forward depends on.',
                },
            ],
        },
    },
];
