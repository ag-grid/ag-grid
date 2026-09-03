import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { findFallbackDemoTitles } from './demoTitleChecker';

function writeHtmlPage(buildDir: string, relativePath: string, title: string) {
    const fullPath = path.join(buildDir, relativePath);
    mkdirSync(path.dirname(fullPath), { recursive: true });
    writeFileSync(fullPath, `<!doctype html><html><head><title>${title}</title></head><body></body></html>`);
}

describe('findFallbackDemoTitles', () => {
    let buildDir: string;

    beforeEach(() => {
        buildDir = mkdtempSync(path.join(tmpdir(), 'demo-title-checker-'));
    });

    afterEach(() => {
        rmSync(buildDir, { recursive: true, force: true });
    });

    it('flags a page whose title is the "Demo - {name}" fallback', () => {
        writeHtmlPage(buildDir, 'example-finance/index.html', 'Demo - Finance');

        expect(findFallbackDemoTitles(buildDir)).toEqual([
            { path: 'example-finance/index.html', title: 'Demo - Finance' },
        ]);
    });

    it('does not flag an approved title that merely contains "Demo" elsewhere', () => {
        writeHtmlPage(
            buildDir,
            'example-inventory/index.html',
            'Inventory Management System Demo - Data Grid | AG Grid'
        );

        expect(findFallbackDemoTitles(buildDir)).toEqual([]);
    });

    it('does not flag a page with no fallback title', () => {
        writeHtmlPage(buildDir, 'getting-started/index.html', 'Getting Started | AG Grid');

        expect(findFallbackDemoTitles(buildDir)).toEqual([]);
    });

    it('reports every offending page when several are affected', () => {
        writeHtmlPage(buildDir, 'example/index.html', 'Demo - Performance Grid');
        writeHtmlPage(buildDir, 'example-hr/index.html', 'Demo - HR Management');
        writeHtmlPage(buildDir, 'getting-started/index.html', 'Getting Started | AG Grid');

        expect(findFallbackDemoTitles(buildDir)).toEqual([
            { path: 'example-hr/index.html', title: 'Demo - HR Management' },
            { path: 'example/index.html', title: 'Demo - Performance Grid' },
        ]);
    });
});
