import rootESLint, { sonarjsConfig } from '../../eslint.config.mjs';

export default [
    ...rootESLint,
    ...sonarjsConfig,
    {
        rules: {
            'prefer-rest-params': 'error',
            'no-extra-boolean-cast': 'error',
            '@typescript-eslint/no-unused-vars': 'error',
            '@typescript-eslint/no-unsafe-function-type': 'error',
            '@typescript-eslint/no-wrapper-object-types': 'error',
            '@typescript-eslint/no-this-alias': 'off',
            'no-console': 'error',
        },
    },
    {
        files: ['src/components/utils.ts'],
        rules: {
            'sonarjs/no-commented-code': 'off',
        },
    },
    {
        ignores: ['updateGridAndColumnProperties.cjs', 'eslint.config.mjs', 'vite.config.d.ts'],
    },
];
