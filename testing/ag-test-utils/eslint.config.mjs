import rootESLint from '../../eslint.config.mjs';
import { noGuessedDelays } from '../shared/eslint/rules.mjs';

export default [
    ...rootESLint,
    {
        // Scoped to the sources the project covers, and named explicitly: left to auto-detection,
        // typescript-eslint finds both this repo root and external/ag-shared and refuses to parse at all.
        files: ['src/**/*.ts', 'src/**/*.tsx'],
        languageOptions: {
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            // These files were under testing/behavioural until this package existed, where the ban applied.
            'no-restricted-syntax': noGuessedDelays,
            // As in testing/behavioural, whose config these files inherited before they moved here:
            // TypeScript already reports undefined identifiers, while this rule cannot see DOM lib types
            // (TouchEventInit, ParentNode) or vitest's globals, and reports every use of them.
            'no-undef': 0,
        },
    },
];
