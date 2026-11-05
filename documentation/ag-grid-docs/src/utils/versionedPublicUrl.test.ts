import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { versionedPublicUrl } from './versionedPublicUrl';

describe('versionedPublicUrl', () => {
    it('appends a hash of the file contents', () => {
        const file = '/scripts/bryntum-demo-bootstrap.js';
        const contents = readFileSync(path.join(process.cwd(), 'public', file));
        const hash = createHash('sha256').update(contents).digest('hex').slice(0, 8);

        expect(versionedPublicUrl(file)).toMatch(new RegExp(`/scripts/bryntum-demo-bootstrap\\.js\\?v=${hash}$`));
    });

    it('throws for a file that does not exist', () => {
        expect(() => versionedPublicUrl('/scripts/does-not-exist.js')).toThrow();
    });
});
