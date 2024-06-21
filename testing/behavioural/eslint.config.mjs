import rootESLint from '../../eslint.config.mjs';

export default [
    ...rootESLint,

    {
        files: ['*.js'],
        rules: {
            '@typescript-eslint/no-var-requires': 0,
        },
    },
];
