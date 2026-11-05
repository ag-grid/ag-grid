import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { urlWithBaseUrl } from './urlWithBaseUrl';

const PUBLIC_DIR = path.join(process.cwd(), 'public');

/**
 * `urlWithBaseUrl` for a file under `public/`, with a `v` query parameter
 * holding a hash of the file's contents.
 *
 * Files under `public/` keep the same URL across deploys and are served with a
 * day-long cache lifetime, so without this a browser can pair freshly deployed
 * HTML with a stale copy of a script it depends on.
 */
export const versionedPublicUrl = (url: string): string => {
    const contents = readFileSync(path.join(PUBLIC_DIR, url));
    const hash = createHash('sha256').update(contents).digest('hex').slice(0, 8);
    return `${urlWithBaseUrl(url)}?v=${hash}`;
};
