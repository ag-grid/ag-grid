import type { IncomingHttpHeaders } from 'node:http';

import { AI_API_PROXY_PATH } from '../../../ag-shared/scripts/plugin-utils/aiApi';

/** A quoted proxy path, as generated into dev examples, e.g. `'/ai-api-proxy'` */
const QUOTED_PROXY_PATH_REGEX = new RegExp(`(['"\`])${AI_API_PROXY_PATH}(?=[/'"\`])`, 'g');

/** Whether a proxied request came from a page served by the dev server itself */
export function isSameOriginRequest(headers: IncomingHttpHeaders): boolean {
    return headers['sec-fetch-site'] === 'same-origin';
}

/** Remove upstream CORS headers, so the dev server's own CORS configuration applies */
export function removeCorsHeaders(headers: IncomingHttpHeaders): void {
    for (const name of Object.keys(headers)) {
        if (name.toLowerCase().startsWith('access-control-')) {
            delete headers[name];
        }
    }
}

/** Returns a check that is `true` only the first time it is called with each key */
export function createFirstTimeCheck(): (key: string) => boolean {
    const seen = new Set<string>();
    return (key) => {
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    };
}

/**
 * Point the relative proxy path in exported dev examples at the dev server they were exported
 * from, so they keep working on Plunker and CodeSandbox while it runs. Mutates `files` in place.
 */
export function absoluteAiApiProxyUrls(files: Record<string, string>, origin: string): void {
    for (const [fileName, content] of Object.entries(files)) {
        files[fileName] = content.replace(QUOTED_PROXY_PATH_REGEX, `$1${origin}${AI_API_PROXY_PATH}`);
    }
}
