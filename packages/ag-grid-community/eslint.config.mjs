import rootESLint from '../../eslint.config.mjs';

export default [
    ...rootESLint,
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
            '@typescript-eslint/ban-types': 'error',
            '@typescript-eslint/no-unused-vars': 'error',
            '@typescript-eslint/no-var-requires': 'error',
            '@typescript-eslint/prefer-as-const': 'error',
            '@typescript-eslint/ban-ts-comment': 'error',
            '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
            '@typescript-eslint/no-unnecessary-type-constraint': 'error',
            '@typescript-eslint/no-this-alias': 'off',
            '@typescript-eslint/no-for-in-array': 'error',
            'no-restricted-syntax': ['error', 'ForInStatement'],

            '@typescript-eslint/naming-convention': [
                'error',
                {
                    selector: 'classMethod',
                    modifiers: ['private'],
                    format: ['camelCase'],
                    trailingUnderscore: 'require',
                },
                {
                    selector: 'classMethod',
                    modifiers: ['protected'],
                    format: ['camelCase'],
                    trailingUnderscore: 'forbid',
                },
                {
                    selector: 'classMethod',
                    modifiers: ['public'],
                    format: ['camelCase'],
                    trailingUnderscore: 'forbid',
                },
                {
                    selector: 'classProperty',
                    modifiers: ['private'],
                    format: ['camelCase'],
                    trailingUnderscore: 'require',
                },
                {
                    selector: 'classProperty',
                    modifiers: ['protected'],
                    format: ['camelCase'],
                    trailingUnderscore: 'forbid',
                },
                {
                    selector: 'classProperty',
                    modifiers: ['public'],
                    format: ['camelCase'],
                    trailingUnderscore: 'forbid',
                },
            ],

            // todo: enable this rule
            'dot-notation': 'off',
            '@typescript-eslint/method-signature-style': 'off',
        },
    },
    {
        ignores: ['webpack.config.js', 'jest.*.js', 'eslint.config.mjs', 'scripts/build-css.ts'],
    },
];
