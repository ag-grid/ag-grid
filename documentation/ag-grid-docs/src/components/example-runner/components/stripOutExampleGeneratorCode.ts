import {
    CONSOLE_LOG_REGEX,
    DARK_INTEGRATED_REGEX,
    TEAR_DOWN_REGEX,
    TEST_ID_REGEX,
} from '@ag-website-shared/utils/extraCodeSnippets';
import type { FileContents } from '@components/example-generator/types';

const MAIN_FILES = ['main.js', 'main.ts', 'index.tsx', 'index.jsx', 'app.component.ts'];

const AI_API_TOKEN_REGEX = /(const AI_API_TOKEN\s*=\s*)(['"`])[^'"`]+\2/g;

/**
 * Strip the harness code the example generator injects (integrated theme switcher,
 * console logging, teardown, test-id setup) from the main files, and redact AI API
 * tokens across all files. Mutates `files` in place.
 */
export function stripOutExampleGeneratorCode(files: FileContents) {
    MAIN_FILES.forEach((mainFile) => {
        if (files[mainFile]) {
            // hide integrated theme switcher
            files[mainFile] =
                files[mainFile]?.replace(DARK_INTEGRATED_REGEX, '').replace(CONSOLE_LOG_REGEX, '').trim() + '\n';

            // Hide the example tear down code use in Documentation tests
            files[mainFile] = files[mainFile]?.replace(TEAR_DOWN_REGEX, '').trim() + '\n';

            // Hide the test id setup code
            files[mainFile] = files[mainFile]?.replace(TEST_ID_REGEX, '').trim() + '\n';
        }
    });

    // Strip AI API token values from all files before displaying in the code viewer
    // and show as redacted. If empty, it will show as empty string.
    for (const fileName of Object.keys(files)) {
        if (typeof files[fileName] === 'string') {
            files[fileName] = files[fileName]!.replace(AI_API_TOKEN_REGEX, '$1$2<TOKEN_REDACTED>$2');
        }
    }
}
