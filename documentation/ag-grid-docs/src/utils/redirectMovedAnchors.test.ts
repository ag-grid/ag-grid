// @vitest-environment jsdom
/**
 * Guards `public/scripts/redirect-moved-anchors.js`: a visit to the old anchor of a section moved to
 * another page goes on to its new location, so external links and bookmarks keep working.
 *
 * Runs the shipped script rather than a module, as the script is what the pages load.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { afterEach, describe, expect, it, vi } from 'vitest';

const SCRIPT = fs.readFileSync(path.resolve(__dirname, '../../public/scripts/redirect-moved-anchors.js'), 'utf8');

const originalLocation = window.location;
const replace = vi.fn();

const MOVED_ANCHORS = {
    'grand-total-row': '/javascript-data-grid/server-side-model-aggregation/#grand-total-row',
};

function runScript(hash: string) {
    Object.defineProperty(window, 'location', { configurable: true, value: { hash, replace } });

    const script = document.createElement('script');
    script.setAttribute('data-moved-anchors', JSON.stringify(MOVED_ANCHORS));
    document.body.appendChild(script);
    Object.defineProperty(document, 'currentScript', { configurable: true, value: script });

    vm.runInThisContext(SCRIPT);
}

describe('redirect-moved-anchors script', () => {
    afterEach(() => {
        Object.defineProperty(window, 'location', { configurable: true, value: originalLocation });
        Object.defineProperty(document, 'currentScript', { configurable: true, value: null });
        document.body.innerHTML = '';
        replace.mockReset();
    });

    it('sends a moved anchor on to its new location', () => {
        runScript('#grand-total-row');

        expect(replace).toHaveBeenCalledWith('/javascript-data-grid/server-side-model-aggregation/#grand-total-row');
    });

    it.each`
        case                              | hash
        ${'no anchor'}                    | ${''}
        ${'an anchor that has not moved'} | ${'#filters'}
        ${'an inherited property name'}   | ${'#constructor'}
    `('stays on the page for $case', ({ hash }) => {
        runScript(hash);

        expect(replace).not.toHaveBeenCalled();
    });

    it('stays on the page when a heading still has the id', () => {
        const heading = document.createElement('h2');
        heading.id = 'grand-total-row';
        document.body.appendChild(heading);

        runScript('#grand-total-row');

        expect(replace).not.toHaveBeenCalled();
    });
});
