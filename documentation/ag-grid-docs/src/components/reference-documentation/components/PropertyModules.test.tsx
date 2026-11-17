import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { PropertyModules } from './PropertyModules';

const COMMUNITY_MODULE = { name: 'ClientSideRowModelModule', isEnterprise: false };
const ENTERPRISE_MODULE = { name: 'RowGroupingModule', isEnterprise: true };

function getLinks(modules: object[]) {
    const html = renderToStaticMarkup(<PropertyModules modules={modules} framework="vue" />);
    return Array.from(html.matchAll(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g), ([, href, content]) => ({
        href,
        content,
    }));
}

describe('PropertyModules', () => {
    it("links the Enterprise icon to the framework's community vs. enterprise page", () => {
        const links = getLinks([ENTERPRISE_MODULE]);

        expect(links).toHaveLength(2);
        expect(links[0].href).toMatch(/\/vue-data-grid\/modules\/$/);
        expect(links[0].content).toContain('RowGroupingModule');
        expect(links[1].href).toMatch(/\/vue-data-grid\/community-vs-enterprise\/$/);
        expect(links[1].content).toContain('ag-reference-icon-enterprise');
    });

    it('only links Community modules to the modules page', () => {
        const links = getLinks([COMMUNITY_MODULE]);

        expect(links).toHaveLength(1);
        expect(links[0].href).toMatch(/\/vue-data-grid\/modules\/$/);
        expect(links[0].content).not.toContain('ag-reference-icon-enterprise');
    });

    it('links the Enterprise icon of each Enterprise module in the popup', () => {
        const links = getLinks([COMMUNITY_MODULE, ENTERPRISE_MODULE]);
        const enterpriseLinks = links.filter(({ href }) => href.endsWith('/community-vs-enterprise/'));

        // The first module shows inline and again in the popup, so the Enterprise module appears once.
        expect(enterpriseLinks).toHaveLength(1);
        expect(links.filter(({ href }) => href.endsWith('/modules/'))).toHaveLength(3);
    });
});
