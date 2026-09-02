import prettier from 'prettier';

import type { InternalFramework } from '../types';
import { TYPESCRIPT_INTERNAL_FRAMEWORKS } from '../types';

// extracted to a separate file as prettier does a dynamic import which jest doesn't like without the addition of
// experimental flags
export async function formatFile(
    internalFramework: InternalFramework,
    fileString: string,
    skipFormatting = false
): Promise<string> {
    // Formatting is roughly half the cost of generating an example and only affects how the code
    // reads in the docs example viewer, so dev builds skip it. Published output is still formatted.
    // Set AG_EXAMPLE_FORMAT=true to format dev output too, e.g. when comparing it against published
    // output.
    if (skipFormatting && process.env.AG_EXAMPLE_FORMAT !== 'true') {
        return fileString;
    }

    // `babel-ts` prints identically to `typescript` but is markedly cheaper: it avoids loading
    // prettier's TypeScript plugin, which dominates the first format call in each worker.
    const parser =
        TYPESCRIPT_INTERNAL_FRAMEWORKS.includes(internalFramework) || internalFramework === 'vanilla'
            ? 'babel-ts'
            : 'babel';
    return await prettier.format(fileString, {
        parser,
    });
}
