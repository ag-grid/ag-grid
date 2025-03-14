import prettier from 'prettier';

import type { InternalFramework } from '../types';
import { TYPESCRIPT_INTERNAL_FRAMEWORKS } from '../types';

// extracted to a separate file as prettier does a dynamic import which jest doesn't like without the addition of
// experimental flags
export async function formatFile(internalFramework: InternalFramework, fileString: string): Promise<string> {
    try {
        const parser =
            TYPESCRIPT_INTERNAL_FRAMEWORKS.includes(internalFramework) || internalFramework === 'vanilla'
                ? 'typescript'
                : 'babel';
        return await prettier.format(fileString, {
            parser,
        });
    } catch (e) {
        console.error(`Error formatting file for ${internalFramework}`, e);
    }
}
