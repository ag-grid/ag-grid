import { resolveMarkdownLinkHref } from './resolveMarkdownLinkHref';

const SITE_ROOT = 'https://www.ag-grid.com';

/*
 * Every link form the docs sources use — `./`, `/`, bare `#`, `https://` and `mailto:` — checked
 * against the rewriting a `.md` twin gets. A twin is read detached from the site, so each has to
 * resolve without a surrounding page.
 */
const resolve = (href: string, framework: 'react' | 'angular' = 'react', pageName = 'cell-editing') =>
    resolveMarkdownLinkHref({ href, framework, pageName, siteRoot: SITE_ROOT });

describe('resolveMarkdownLinkHref', () => {
    test("makes a framework-relative docs link absolute for the twin's own framework", () => {
        expect(resolve('./cell-editors/')).toBe('https://www.ag-grid.com/react-data-grid/cell-editors/');
        expect(resolve('./cell-editors/', 'angular')).toBe('https://www.ag-grid.com/angular-data-grid/cell-editors/');
    });

    test('makes a root-relative site link absolute', () => {
        expect(resolve('/license-pricing/')).toBe('https://www.ag-grid.com/license-pricing/');
    });

    test('anchors a same-page link to the page it was written on, not to nothing', () => {
        expect(resolve('#editing-events')).toBe('https://www.ag-grid.com/react-data-grid/cell-editing/#editing-events');
    });

    test('keeps the anchor on a cross-page link', () => {
        expect(resolve('./cell-editors/#custom-components')).toBe(
            'https://www.ag-grid.com/react-data-grid/cell-editors/#custom-components'
        );
    });

    test('leaves external and mailto links untouched', () => {
        expect(resolve('https://github.com/ag-grid/ag-grid')).toBe('https://github.com/ag-grid/ag-grid');
        expect(resolve('mailto:info@ag-grid.com')).toBe('mailto:info@ag-grid.com');
    });

    test('substitutes the version a docs source writes into an href', () => {
        expect(resolve('/archive/{% $agGridVersion %}/documentation/')).not.toContain('$agGridVersion');
    });

    test('leaves a form it cannot resolve alone rather than mangling it', () => {
        // urlWithPrefix rejects a bare relative path: it cannot tell a framework link from a
        // root one. Better the author's href than a wrong URL.
        expect(resolve('cell-editors/')).toBe('cell-editors/');
    });

    test('stays site-relative when there is no canonical origin to resolve against', () => {
        expect(resolveMarkdownLinkHref({ href: '#editing-events', framework: 'react', pageName: 'cell-editing' })).toBe(
            '/react-data-grid/cell-editing/#editing-events'
        );
    });
});
