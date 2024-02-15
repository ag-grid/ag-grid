module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
  ],
  ignorePatterns: ['dist', '*.cjs', '*.js', 'vite.config.ts', 'tmp.ts'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./src/tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    'react/display-name': 'off',
    'react/prop-types': 'off',
    'no-console': 'warn',
    '@typescript-eslint/require-await': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          // Don't allow code outside of themes API to import from deep inside...
          '*ag-grid-community-themes/*',
          // ... except for this private API designed for THeme Builder to use
          '!*ag-grid-community-themes/metadata',
        ],
      },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
