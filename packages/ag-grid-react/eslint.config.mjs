import reactCompiler from 'eslint-plugin-react-compiler';
import reactHooks from 'eslint-plugin-react-hooks';

import rootESLint from '../../eslint.config.mjs';

export default [
    ...rootESLint,
    reactHooks.configs['recommended-latest'],
    reactCompiler.configs.recommended,
    {
        rules: {
            'no-empty': 'error',
            'prefer-const': ['error', { destructuring: 'all' }],
            'no-useless-escape': 'error',
            'no-extra-boolean-cast': 'error',
            '@typescript-eslint/no-unused-vars': 'error',
            '@typescript-eslint/ban-types': 'error',
            '@typescript-eslint/no-var-requires': 'error',
            'no-console': 'error',
        },
    },
];
