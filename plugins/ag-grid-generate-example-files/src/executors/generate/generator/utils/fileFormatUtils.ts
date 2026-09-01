import prettier from 'prettier';

import type { InternalFramework } from '../types';
import { TYPESCRIPT_INTERNAL_FRAMEWORKS } from '../types';

// extracted to a separate file as prettier does a dynamic import which jest doesn't like without the addition of
// experimental flags
export async function formatFile(internalFramework: InternalFramework, fileString: string): Promise<string> {
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
