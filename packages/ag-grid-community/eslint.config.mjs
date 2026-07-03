import rootESLint, { sonarjsConfig } from '../../eslint.config.mjs';

export default [
    ...rootESLint,
    ...sonarjsConfig,
    {
        languageOptions: {
            parserOptions: {
                // NOTE: Loading tsconfig.json references does not work, so
                // loading explicitly here
                project: ['./tsconfig.lib.json', './tsconfig.spec.json'],
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            'no-fallthrough': 'error',
            'no-case-declarations': 'error',
            'no-prototype-builtins': 'error',
            'no-unexpected-multiline': 'error',
            'no-useless-escape': 'error',
            'prefer-spread': 'error',
            'no-irregular-whitespace': 'error',
            'prefer-const': ['error', { destructuring: 'all' }],
            'prefer-rest-params': 'error',
            '@typescript-eslint/no-unused-vars': 'error',
            '@typescript-eslint/no-var-requires': 'error',
            '@typescript-eslint/prefer-as-const': 'error',
            '@typescript-eslint/prefer-optional-chain': 'error',
            '@typescript-eslint/ban-ts-comment': 'error',
            '@typescript-eslint/prefer-readonly': 'error',
            '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
            '@typescript-eslint/no-unnecessary-type-constraint': 'error',
            '@typescript-eslint/prefer-function-type': 'error',

            // '@typescript-eslint/no-unnecessary-type-assertion': 'error', rule fails on CI
            '@typescript-eslint/no-this-alias': 'off',
            '@typescript-eslint/no-for-in-array': 'error',
            'no-restricted-syntax': [
                'error',
                'ForInStatement',
                {
                    selector: 'Literal[value=/^&(w*);$/i]',
                    message:
                        "Prefer unicode characters as they don't have to be parsed into HTML to display correctly.",
                },
                {
                    selector: 'PropertyDefinition[static=true]',
                    message: 'Static class properties prevent tree-shaking. Use an alternative if possible.',
                },
            ],
            'no-restricted-properties': [
                'error',
                { property: 'innerText', message: 'Prefer textContent where possible' },
                { property: 'innerHTML', message: 'Prefer textContent where possible' },
                {
                    object: 'Object',
                    property: 'entries',
                    message: 'Prefer Object.keys() to Object.entries() for performance reasons.',
                },
                {
                    object: 'document',
                    property: 'createElement',
                    message: 'Prefer the _createElement helper from utils/element over document.createElement.',
                },
            ],
            'no-restricted-imports': [
                'error',
                {
                    name: 'ag-grid-community',
                    message: 'There should be no imports of ag-grid-community, use relative imports instead',
                },
            ],
            'no-console': 'error',

            'unicorn/prefer-modern-dom-apis': 'error',
        },
    },
    {
        // Test files are exempt from the runtime-focused restrictions above.
        files: ['**/*.test.ts', '**/*.test.tsx'],
        rules: {
            'no-restricted-properties': 'off',
        },
    },
    {
        ignores: [
            'webpack.config.js',
            'jest.*.js',
            'eslint.config.mjs',
            'e2e/',
            'playwright.config.ts',
            'esbuildBuild.cjs',
            'vitest.umd.config.ts',
        ],
    },
];
