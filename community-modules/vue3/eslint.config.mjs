import rootESLint from '../../eslint.config.mjs';

export default [
    ...rootESLint,
    {
        rules: {
            'no-undef': 'warn',
            'prefer-rest-params': 'warn',
            'no-extra-boolean-cast': 'warn',
            '@typescript-eslint/no-unused-vars': 'warn',
            '@typescript-eslint/ban-types': 'warn',
            '@typescript-eslint/no-this-alias': 'warn',
        },
    },
];
