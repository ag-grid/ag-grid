import pluginJs from '@eslint/js';
import eslintImportX from 'eslint-plugin-import-x';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// They only match server, Node or AWS CDK APIs, which these packages never call, yet still cost lint time on every file.
const SERVER_SIDE_SONARJS_RULES = [
    ...Object.keys(sonarjs.rules).filter((name) => name.startsWith('aws-')),
    'content-length',
    'content-security-policy',
    'cookie-no-httponly',
    'cors',
    'csrf',
    'dynamically-constructed-templates',
    'encryption-secure-mode',
    'file-permissions',
    'file-uploads',
    'insecure-cookie',
    'insecure-jwt-token',
    'no-mime-sniff',
    'no-os-command-from-path',
    'no-referrer-policy',
    'no-session-cookies-on-static-assets',
    'no-weak-cipher',
    'no-weak-keys',
    'production-debug',
    'publicly-writable-directories',
    'session-regeneration',
    'sql-queries',
    'strict-transport-security',
    'unverified-certificate',
    'unverified-hostname',
    'weak-ssl',
    'x-powered-by',
    'xml-parser-xxe',
];

// They only match test-framework code, so they run on test files alone.
const TEST_SONARJS_RULES = [
    'assertions-in-test-cases',
    'async-test-assertions',
    'chai-determinate-assertion',
    'disabled-timeout',
    'explicit-test-skip',
    'hooks-before-test-cases',
    'inverted-assertion-arguments',
    'no-code-after-done',
    'no-debug-commands-in-ui-tests',
    'no-duplicate-parameterized-test-case',
    'no-duplicate-test-title',
    'no-empty-parameterized-test-dataset',
    'no-empty-test-file',
    'no-empty-test-title',
    'no-exclusive-tests',
    'no-fixed-wait-in-tests',
    'no-forced-browser-interaction',
    'no-incompatible-assertion-types',
    'no-incomplete-assertions',
    'no-interpolation-in-inline-snapshots',
    'no-networkidle-wait',
    'no-same-argument-assert',
    'no-skipped-tests',
    'no-trivial-assertions',
    'parameterized-tests',
    'prefer-cypress-should',
    'prefer-specific-assertions',
    'stable-tests',
    'synchronous-exception-assertions',
    'synchronous-suite-callback',
    'test-check-exception',
    'testing-library-prefer-query-by-disappearance',
    'testing-library-query-assertion',
    'vitest-mock-at-module-scope',
];

export const sonarjsConfig = [
    sonarjs.configs.recommended,
    {
        files: ['**/*.{js,ts,tsx}'],
        rules: {
            // The plan is to work through these rules and enable them where possible.
            // For now, turning them off to avoid noise and enable other sonarjs rules.
            'sonarjs/no-duplicate-string': 0,
            'sonarjs/sonar-max-params': 0,
            // Too noisy in this codebase's style: doesn't trust a `!` non-null assertion, a prior
            // typeof/guard narrowing, or a type predicate, so it flags hundreds of already-safe sites.
            'sonarjs/null-dereference': 0,
            'sonarjs/todo-tag': 0,
            'sonarjs/fixme-tag': 0,
            'sonarjs/no-redeclare': 0,
            'sonarjs/function-return-type': 0,
            'sonarjs/max-switch-cases': 0,

            'sonarjs/different-types-comparison': 0,
            'sonarjs/slow-regex': 0,
            'sonarjs/no-selector-parameter': 0,
            'sonarjs/redundant-type-aliases': 0,
            'sonarjs/new-cap': 0,
            'sonarjs/deprecation': 0,
            'sonarjs/cognitive-complexity': 0,
            'sonarjs/class-name': 0,
            'sonarjs/no-nested-functions': 0,
            'sonarjs/no-nested-conditional': 0,
            'sonarjs/pseudo-random': 0,
            'sonarjs/public-static-readonly': 0,
            'sonarjs/no-redundant-optional': 0,
            'sonarjs/no-ignored-exceptions': 0,
            'sonarjs/no-alphabetical-sort': 0,
            'sonarjs/assertions-in-tests': 0,
            'sonarjs/no-redundant-boolean': 0,
            'sonarjs/no-async-constructor': 0,
            'sonarjs/updated-loop-counter': 0,
            'sonarjs/no-unused-vars': 0,
            'sonarjs/no-misleading-array-reverse': 0,
            'sonarjs/no-useless-intersection': 0,
            'sonarjs/no-nested-assignment': 0,
            'sonarjs/prefer-regexp-exec': 0,
            'sonarjs/concise-regex': 0,

            // Duplicates @typescript-eslint
            'sonarjs/sonar-no-unused-vars': 0,
            'sonarjs/no-redundant-type-constituents': 0,
            'sonarjs/no-base-to-string': 0,
            'sonarjs/no-misused-promises': 0,
            'sonarjs/no-fallthrough': 0,

            ...Object.fromEntries(SERVER_SIDE_SONARJS_RULES.map((name) => [`sonarjs/${name}`, 0])),

            // Core ESLint rules matching SonarCloud issues.
            'prefer-object-spread': 'error',

            // Unicorn rules, as referenced from the SonarCloud documentation.
            'unicorn/no-negation-in-equality-check': 'error',
            'unicorn/no-typeof-undefined': 'error',
            'unicorn/no-useless-fallback-in-spread': 'error',
            'unicorn/prefer-array-some': 'error',
            'unicorn/prefer-dom-node-dataset': 'error',
            'unicorn/prefer-native-coercion-functions': 'error',
            'unicorn/prefer-number-properties': 'error',
            'unicorn/prefer-single-call': 'error',
            'unicorn/prefer-string-raw': 'error',
            'unicorn/prefer-dom-node-remove': 1,
            'unicorn/no-zero-fractions': 0,
            'unicorn/prefer-at': 0,
            'unicorn/prefer-export-from': 0,
            'unicorn/prefer-includes': 0,
            'unicorn/prefer-math-trunc': 0,
            // 'unicorn/no-array-for-each': 1,
            // 'unicorn/prefer-modern-dom-apis': 1,

            // Import rules, as referenced from the SonarCloud documentation.
            'import-x/no-mutable-exports': 'error',
        },
    },
    {
        files: ['**/*.{js,ts,tsx}'],
        ignores: ['**/*.{test,spec}.{js,ts,tsx}', '**/test-utils/**'],
        rules: Object.fromEntries(TEST_SONARJS_RULES.map((name) => [`sonarjs/${name}`, 0])),
    },
];

export default [
    { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    { plugins: { 'import-x': eslintImportX, unicorn } },
    {
        ignores: ['node_modules/', 'dist/', '.astro/', '**/env.d.ts', 'coverage', '**/.dependency-cruiser.js'],
    },
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-empty-object-type': 'off',
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/consistent-type-imports': [
                'error',
                {
                    prefer: 'type-imports',
                    fixStyle: 'separate-type-imports',
                },
            ],
            'import-x/consistent-type-specifier-style': 'error',
            'no-duplicate-imports': ['error', { allowSeparateTypeImports: true }],
            '@typescript-eslint/no-this-alias': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_+$',
                },
            ],
            // Disallow using logical short-circuit expressions as control flow (eg. `a && fn()`).
            '@typescript-eslint/no-unused-expressions': [
                'error',
                {
                    allowShortCircuit: false,
                    allowTernary: false,
                    allowTaggedTemplates: false,
                },
            ],
            'no-undef': 'warn',
            'no-lonely-if': 'error',
            curly: 'error',
        },
    },
    {
        // cypress uses a global API based on undefined variables
        files: [
            '**/*.spec.{ts,js}',
            '**/*test.{ts,js,mjs}',
            '**/{cypress,_copiedFromCore,__tests__}/**',
            '**/test-utils/**',
        ],
        rules: {
            'no-undef': 'off',
        },
    },
];
