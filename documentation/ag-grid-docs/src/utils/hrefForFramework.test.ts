import { describe, expect, it } from 'vitest';

import { hrefForFramework } from './hrefForFramework';

describe('hrefForFramework', () => {
    it('moves a Grid page link to the given framework', () => {
        expect(hrefForFramework({ href: '/react-data-grid/community-vs-enterprise/', framework: 'vue' })).toBe(
            '/vue-data-grid/community-vs-enterprise/'
        );
    });

    it('works from any framework, so a link can be moved more than once', () => {
        expect(hrefForFramework({ href: '/angular-data-grid/getting-started/', framework: 'javascript' })).toBe(
            '/javascript-data-grid/getting-started/'
        );
    });

    it('keeps the base URL and the hash', () => {
        expect(
            hrefForFramework({
                href: 'https://www.ag-grid.com/react-data-grid/community-vs-enterprise/#request-a-30-day-enterprise-bundle-trial-licence',
                framework: 'angular',
            })
        ).toBe(
            'https://www.ag-grid.com/angular-data-grid/community-vs-enterprise/#request-a-30-day-enterprise-bundle-trial-licence'
        );
    });

    it('moves a Charts page link to the given framework, staying in Charts', () => {
        expect(
            hrefForFramework({
                href: 'https://www.ag-grid.com/charts/react/community-vs-enterprise/',
                framework: 'vue',
            })
        ).toBe('https://www.ag-grid.com/charts/vue/community-vs-enterprise/');
    });

    it('leaves links with no framework path alone', () => {
        expect(hrefForFramework({ href: '/license-pricing/', framework: 'vue' })).toBe('/license-pricing/');
        expect(hrefForFramework({ href: '/data-grid/community-vs-enterprise/', framework: 'vue' })).toBe(
            '/data-grid/community-vs-enterprise/'
        );
    });
});
