import { describe, expect, it } from 'vitest';

import { hrefForFramework } from './hrefForFramework';

const pageName = 'community-vs-enterprise';

describe('hrefForFramework', () => {
    it('moves a framework page link to the given framework', () => {
        expect(
            hrefForFramework({ href: '/react-data-grid/community-vs-enterprise/', pageName, framework: 'vue' })
        ).toBe('/vue-data-grid/community-vs-enterprise/');
    });

    it('works from any framework, so a link can be moved more than once', () => {
        expect(
            hrefForFramework({ href: '/angular-data-grid/community-vs-enterprise/', pageName, framework: 'javascript' })
        ).toBe('/javascript-data-grid/community-vs-enterprise/');
    });

    it('keeps the base URL and the hash', () => {
        expect(
            hrefForFramework({
                href: 'https://www.ag-grid.com/react-data-grid/community-vs-enterprise/#request-a-30-day-enterprise-bundle-trial-licence',
                pageName,
                framework: 'angular',
            })
        ).toBe(
            'https://www.ag-grid.com/angular-data-grid/community-vs-enterprise/#request-a-30-day-enterprise-bundle-trial-licence'
        );
    });

    it('leaves links to other pages alone', () => {
        expect(hrefForFramework({ href: '/react-data-grid/getting-started/', pageName, framework: 'vue' })).toBe(
            '/react-data-grid/getting-started/'
        );
        expect(hrefForFramework({ href: '/license-pricing/', pageName, framework: 'vue' })).toBe('/license-pricing/');
    });

    it('leaves the framework-neutral /data-grid/ link alone', () => {
        expect(hrefForFramework({ href: '/data-grid/community-vs-enterprise/', pageName, framework: 'vue' })).toBe(
            '/data-grid/community-vs-enterprise/'
        );
    });
});
