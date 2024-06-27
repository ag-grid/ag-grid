import rootESLint from '../../eslint.config.mjs';

export default [
    ...rootESLint,
    {
        rules: {
            '@typescript-eslint/ban-ts-comment': 'warn',
            '@typescript-eslint/ban-types': 'warn',
            'prefer-const': 'warn',
            'no-extra-boolean-cast': 'warn',
        },
    },
];
