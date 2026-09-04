import type { CategorizedSitemap } from '@ag-website-shared/components/sitemap/Sitemap';

import { buildSitePageIndex } from './sitePageIndex';

const SITEMAP: CategorizedSitemap = {
    General: [
        { url: 'https://www.ag-grid.com/about/', pageName: 'About' },
        { url: 'https://www.ag-grid.com/license-pricing/', pageName: 'License Pricing' },
    ],
    'Javascript Data Grid': [
        { url: 'https://www.ag-grid.com/javascript-data-grid/getting-started/', pageName: 'Getting Started' },
        { url: 'https://www.ag-grid.com/javascript-data-grid/hidden-page/', pageName: 'Hidden Page' },
    ],
    'React Data Grid': [
        { url: 'https://www.ag-grid.com/react-data-grid/getting-started/', pageName: 'Getting Started' },
    ],
    Community: [{ url: 'https://www.ag-grid.com/community/events/', pageName: 'Events' }],
};

const build = (navPages: string[]) =>
    buildSitePageIndex({
        parsedSitemap: SITEMAP,
        navPages: new Set(navPages),
        canonicalFramework: 'javascript',
    });

describe('buildSitePageIndex', () => {
    const siteIndex = build(['getting-started']);
    const groups = Object.fromEntries(siteIndex.map(({ title, links }) => [title, links]));

    test('keeps the sitemap categories for pages that are not documentation', () => {
        expect(groups['General']).toEqual([
            { title: 'About', url: 'https://www.ag-grid.com/about/' },
            { title: 'License Pricing', url: 'https://www.ag-grid.com/license-pricing/' },
        ]);
        expect(groups['Community']).toEqual([{ title: 'Events', url: 'https://www.ag-grid.com/community/events/' }]);
    });

    test('drops documentation pages the navigation already lists, in every framework', () => {
        expect(siteIndex.map(({ title }) => title)).not.toContain('React Data Grid');
        expect(groups['Javascript Data Grid']).toBeUndefined();
        expect(JSON.stringify(siteIndex)).not.toContain('getting-started');
    });

    test('publishes a docs page the navigation does not reach, rather than dropping it', () => {
        expect(groups['Documentation > Not in the navigation']).toEqual([
            { title: 'Hidden Page', url: 'https://www.ag-grid.com/javascript-data-grid/hidden-page/' },
        ]);
    });

    test('lists an unreached page once, not once per framework', () => {
        const unlisted = build([]).find(({ title }) => title === 'Documentation > Not in the navigation');

        expect(unlisted?.links.map(({ title }) => title)).toEqual(['Getting Started', 'Hidden Page']);
    });

    test('drops the group entirely once the navigation covers every docs page', () => {
        expect(build(['getting-started', 'hidden-page']).map(({ title }) => title)).toEqual(['General', 'Community']);
    });
});
