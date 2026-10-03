import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config({
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.ts'],
    languageOptions: {
        ecmaVersion: 2022,
        globals: globals.node,
    },
    rules: {
        // AWS CLI JSON is read untyped on purpose: the checks compare it field by field.
        '@typescript-eslint/no-explicit-any': 'off',
    },
});
