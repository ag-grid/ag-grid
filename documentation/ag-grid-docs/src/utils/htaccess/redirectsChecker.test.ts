import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { checkRedirect } from './redirectsChecker';

describe('checkRedirect', () => {
    let buildDir: string;

    const addBuildFile = (filePath: string) => {
        const fullPath = join(buildDir, filePath);
        mkdirSync(dirname(fullPath), { recursive: true });
        writeFileSync(fullPath, '');
    };

    const check = (redirect: Parameters<typeof checkRedirect>[0], disableMarkdownDocs = false) =>
        checkRedirect(redirect, { buildDir, disableMarkdownDocs });

    beforeEach(() => {
        buildDir = mkdtempSync(join(tmpdir(), 'redirects-checker-'));
    });

    afterEach(() => {
        rmSync(buildDir, { recursive: true, force: true });
    });

    describe('a directory redirect', () => {
        it('succeeds when the target page is built', () => {
            addBuildFile('new-page/index.html');

            expect(check({ from: '/old-page/', to: '/new-page/' })).toMatchObject({ type: 'success' });
        });

        it('checks the directory index for a target without a trailing slash', () => {
            addBuildFile('new-page/index.html');

            expect(check({ from: '/old-page/', to: '/new-page' })).toMatchObject({ type: 'success' });
        });

        it('errors when the target page is missing', () => {
            expect(check({ from: '/old-page/', to: '/new-page/' })).toMatchObject({
                type: 'error',
                message: 'File not found',
            });
        });

        it('errors when the source is still a built page', () => {
            addBuildFile('old-page/index.html');
            addBuildFile('new-page/index.html');

            expect(check({ from: '/old-page/', to: '/new-page/' })).toMatchObject({
                type: 'error',
                message: 'Redirect shadows existing page',
            });
        });

        it('checks the directory index when a segment has a dot', () => {
            mkdirSync(join(buildDir, 'archive/31.0.0'), { recursive: true });

            expect(check({ from: '/old-page/', to: '/archive/31.0.0/' })).toMatchObject({
                type: 'error',
                message: 'File not found',
            });
        });

        it('still errors on a missing target page when markdown docs are disabled', () => {
            expect(check({ from: '/old-page/', to: '/new-page/' }, true)).toMatchObject({
                type: 'error',
                message: 'File not found',
            });
        });
    });

    describe('a .md redirect', () => {
        const redirect = { from: '/old-page.md', to: '/new-page.md' };

        it('succeeds when the target file is built', () => {
            addBuildFile('new-page.md');

            expect(check(redirect)).toMatchObject({ type: 'success' });
        });

        it('errors when the source file is still built', () => {
            addBuildFile('old-page.md');
            addBuildFile('new-page.md');

            expect(check(redirect)).toMatchObject({ type: 'error', message: 'Redirect shadows existing page' });
        });

        it('errors when the target file is missing', () => {
            expect(check(redirect)).toMatchObject({ type: 'error', message: 'File not found' });
        });

        it('ignores a missing target file when markdown docs are disabled', () => {
            expect(check(redirect, true)).toMatchObject({ type: 'ignored', path: '/new-page.md' });
        });

        it('succeeds when the target file is built even with markdown docs disabled', () => {
            addBuildFile('new-page.md');

            expect(check(redirect, true)).toMatchObject({ type: 'success' });
        });
    });
});
