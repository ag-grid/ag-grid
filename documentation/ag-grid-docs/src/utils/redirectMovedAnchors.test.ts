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

const PAGE = '/javascript-data-grid/server-side-model-grouping/';
const NEW_LOCATION = '/javascript-data-grid/server-side-model-aggregation/#grand-total-row';

const originalLocation = window.location;
const assign = vi.fn();
const replace = vi.fn();
const location = { pathname: PAGE, search: '', hash: '', assign, replace };

function runScript(hash: string) {
    location.hash = hash;
    Object.defineProperty(window, 'location', { configurable: true, value: location });

    const script = document.createElement('script');
    script.setAttribute('data-moved-anchors', JSON.stringify({ 'grand-total-row': NEW_LOCATION }));
    document.body.appendChild(script);
    Object.defineProperty(document, 'currentScript', { configurable: true, value: script });

    vm.runInThisContext(SCRIPT);
}

function clickLink(href: string, init: MouseEventInit = {}) {
    const link = document.createElement('a');
    link.href = new URL(href, 'https://www.ag-grid.com' + PAGE).href;
    link.addEventListener('click', (event) => event.preventDefault());
    document.body.appendChild(link);
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ...init }));
}

describe('redirect-moved-anchors script', () => {
    afterEach(() => {
        document.dispatchEvent(new Event('astro:before-swap'));
        Object.defineProperty(window, 'location', { configurable: true, value: originalLocation });
        Object.defineProperty(document, 'currentScript', { configurable: true, value: null });
        document.body.innerHTML = '';
        vi.resetAllMocks();
    });

    it('sends a moved anchor on to its new location on arrival', () => {
        runScript('#grand-total-row');

        expect(replace).toHaveBeenCalledWith(NEW_LOCATION);
    });

    it.each`
        case                              | hash
        ${'no anchor'}                    | ${''}
        ${'an anchor that has not moved'} | ${'#filters'}
        ${'an inherited property name'}   | ${'#constructor'}
        ${'a malformed escape'}           | ${'#100%'}
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

    it('sends a link on the page to a moved anchor on to its new location', () => {
        runScript('');

        clickLink('#grand-total-row');

        expect(assign).toHaveBeenCalledWith(NEW_LOCATION);
    });

    it('leaves a link to a moved anchor alone when it opens another tab', () => {
        runScript('');

        clickLink('#grand-total-row', { metaKey: true });

        expect(assign).not.toHaveBeenCalled();
    });

    it('sends a fragment changed to a moved anchor on to its new location', () => {
        runScript('');

        location.hash = '#grand-total-row';
        window.dispatchEvent(new HashChangeEvent('hashchange'));

        expect(replace).toHaveBeenCalledWith(NEW_LOCATION);
    });

    it('stops redirecting once another page is swapped in', () => {
        runScript('');
        document.dispatchEvent(new Event('astro:before-swap'));

        clickLink('#grand-total-row');
        location.hash = '#grand-total-row';
        window.dispatchEvent(new HashChangeEvent('hashchange'));

        expect(assign).not.toHaveBeenCalled();
        expect(replace).not.toHaveBeenCalled();
    });
});
