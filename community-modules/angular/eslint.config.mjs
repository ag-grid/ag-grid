import rootESLint from '../../eslint.config.mjs';

export default [
    ...rootESLint,
    {
        ignores: ['dist/', '.angular/'],
    },
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/ban-types': 'warn',
            '@typescript-eslint/no-this-alias': 'warn',
            '@typescript-eslint/no-var-requires': 'warn',
            '@typescript-eslint/no-unused-vars': 'warn',
            'no-undef': 'warn',
        },
    },
];
