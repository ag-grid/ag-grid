module.exports = {
  root: true,
  env: {
    es2022: true,
  },
  extends: ['plugin:prettier/recommended'],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  overrides: [
    {
      files: ['.eslintrc.cjs'],
      env: {
        node: true,
      },
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  rules: {
    'no-warning-comments': [
      'warn',
      {
        terms: ['fixme'],
      },
    ],
    'prettier/prettier': 'warn',
  },
};
