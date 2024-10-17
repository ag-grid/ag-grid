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
            'no-fallthrough': 'warn',
            'no-case-declarations': 'warn',
            'no-prototype-builtins': 'warn',
            'no-unexpected-multiline': 'warn',
            'no-useless-escape': 'warn',
            'prefer-spread': 'warn',
            'no-irregular-whitespace': 'warn',
            'prefer-const': 'warn',
            'prefer-rest-params': 'warn',
            '@typescript-eslint/ban-types': 'warn',
            '@typescript-eslint/no-unused-vars': 'warn',
            '@typescript-eslint/no-var-requires': 'warn',
            '@typescript-eslint/prefer-as-const': 'warn',
            '@typescript-eslint/ban-ts-comment': 'warn',
            '@typescript-eslint/no-non-null-asserted-optional-chain': 'warn',
            '@typescript-eslint/no-unnecessary-type-constraint': 'warn',
            '@typescript-eslint/no-this-alias': 'off',
            '@typescript-eslint/no-for-in-array': 'error',
            'no-restricted-syntax': ['error', 'ForInStatement'],
        },
    },
    {
        ignores: ['webpack.config.js', 'jest.*.js', 'eslint.config.mjs', 'scripts/build-css.ts'],
    },
];
