import { describe, expect, it } from 'vitest';

import {
    describeInternalLinkShapeIssue,
    getCanonicalHostPath,
    getInternalLinkShapeIssues,
    isInternalHref,
} from './internalLinkShape';

const types = (href: string, options?: Parameters<typeof getInternalLinkShapeIssues>[1]) =>
    getInternalLinkShapeIssues(href, options).map((issue) => issue.type);

describe('getInternalLinkShapeIssues', () => {
    describe('links already in their final form', () => {
        it.each([
            '/',
            '/charts/',
            '/react-data-grid/getting-started/',
            '/react-data-grid/getting-started/?foo=1',
            '/react-data-grid/getting-started/#quick-start',
            '/example/?theme=quartz',
            '/archive/26.0.0/',
            '/studio/r/security/',
            'https://www.ag-grid.com/',
            'https://www.ag-grid.com/charts/',
            'https://www.ag-grid.com/campaigns/bryntum-gantt/',
            // A bare canonical host is normalised to `/` by the browser and served directly
            'https://www.ag-grid.com',
        ])('%s', (href) => {
            expect(types(href)).toEqual([]);
        });
    });

    describe('file links take no trailing slash', () => {
        it.each([
            '/sitemap.xml',
            '/robots.txt',
            '/llms.txt',
            '/react-data-grid/getting-started.md',
            '/favicon.ico',
            '/scripts/license-pricing.js',
            'https://www.ag-grid.com/images/fw-logos/react.svg',
            '/fonts/pdf-export/OFL-Noto.license',
        ])('%s', (href) => {
            expect(types(href)).toEqual([]);
        });

        it('treats a version directory as a directory, not a `.0` file', () => {
            expect(types('/archive/26.0.0')).toEqual(['missing-trailing-slash']);
            expect(types('/charts/archive/13.3.1')).toEqual(['missing-trailing-slash']);
        });
    });

    describe('links the checker does not own', () => {
        it.each([
            '',
            '#section',
            '#',
            'mailto:info@ag-grid.com',
            'tel:+441234567890',
            'javascript:void(0)',
            'https://github.com/ag-grid/ag-grid',
            'https://blog.ag-grid.com/whats-new',
            'https://img.shields.io/badge/ag--grid.com',
            './relative',
            'relative',
        ])('%s', (href) => {
            expect(types(href)).toEqual([]);
        });
    });

    describe('missing trailing slash', () => {
        it.each([
            // The exact shapes the 2 August crawl found still live
            '/charts',
            '/studio',
            '/whats-new',
            '/campaigns/bryntum-gantt',
            '/react-data-grid/aggregation',
            '/niall',
            '/studio/r/security',
            'https://www.ag-grid.com/charts',
            'https://www.ag-grid.com/studio/whats-new',
            'https://www.ag-grid.com/campaigns/bryntum-task-board',
        ])('%s', (href) => {
            expect(types(href)).toEqual(['missing-trailing-slash']);
        });

        it('inspects the pathname ahead of a query string or fragment', () => {
            expect(types('/example?theme=quartz')).toEqual(['missing-trailing-slash']);
            expect(types('/changelog?fixVersion=32.0.1')).toEqual(['missing-trailing-slash']);
            expect(types('/react-data-grid/side-bar#reference-ToolPanelDef-parent')).toEqual([
                'missing-trailing-slash',
            ]);
            expect(types('/charts/gallery?ref=x')).toEqual(['missing-trailing-slash']);
        });

        it('reports the pathname that will be redirected to', () => {
            const [issue] = getInternalLinkShapeIssues('/charts?utm_source=x');
            expect(issue).toEqual({
                type: 'missing-trailing-slash',
                href: '/charts?utm_source=x',
                pathname: '/charts',
            });
        });

        it('exempts a page served as a standalone .html file', () => {
            const isHtmlFile = (pathname: string) => pathname === '/404';
            expect(types('/404', { isHtmlFile })).toEqual([]);
            expect(types('/not-a-file', { isHtmlFile })).toEqual(['missing-trailing-slash']);
        });
    });

    describe('redirecting hosts', () => {
        it.each([
            ['https://ag-grid.com/charts/', 'ag-grid.com'],
            ['https://charts.ag-grid.com/themes-api/', 'charts.ag-grid.com'],
            ['https://studio.ag-grid.com/licensing/', 'studio.ag-grid.com'],
            ['//ag-grid.com/charts/', 'ag-grid.com'],
        ])('%s', (href, host) => {
            expect(getInternalLinkShapeIssues(href)).toEqual([{ type: 'redirecting-host', href, host }]);
        });

        it('reports the host and the slash independently', () => {
            expect(types('https://ag-grid.com/charts')).toEqual(['redirecting-host', 'missing-trailing-slash']);
        });

        describe('the pre-10.1 charts archive is served only from the legacy host', () => {
            it.each([
                'https://charts.ag-grid.com/archive/9.3.2/documentation/',
                'https://charts.ag-grid.com/archive/10.0.2/documentation/',
                'https://charts.ag-grid.com/archive/',
            ])('%s is canonical', (href) => {
                expect(types(href)).toEqual([]);
            });

            it('still asks the legacy archive for its trailing slash', () => {
                expect(types('https://charts.ag-grid.com/archive/9.3.2/documentation')).toEqual([
                    'missing-trailing-slash',
                ]);
            });

            it('still flags every other path on the legacy host', () => {
                expect(types('https://charts.ag-grid.com/')).toEqual(['redirecting-host']);
                expect(types('https://charts.ag-grid.com/themes-api/')).toEqual(['redirecting-host']);
            });

            it('does not extend the exemption to the other legacy hosts', () => {
                expect(types('https://studio.ag-grid.com/archive/1.0.0/')).toEqual(['redirecting-host']);
                expect(types('https://ag-grid.com/archive/26.0.0/')).toEqual(['redirecting-host']);
            });
        });
    });

    describe('insecure scheme', () => {
        it('flags http:// on the canonical host', () => {
            expect(types('http://www.ag-grid.com/charts/')).toEqual(['insecure-scheme']);
        });

        it('flags scheme and host together on a bare apex', () => {
            expect(types('http://ag-grid.com/charts/')).toEqual(['insecure-scheme', 'redirecting-host']);
        });
    });

    describe('utm parameters', () => {
        it.each([
            '/react-data-grid/getting-started/?utm_source=blog',
            'https://www.ag-grid.com/charts/?ref=nav&utm_medium=email',
            '/react-data-grid/getting-started/?UTM_Campaign=launch#quick-start',
            '//www.ag-grid.com/charts/?utm_source=x',
        ])('%s', (href) => {
            expect(types(href)).toEqual(['utm-parameters']);
        });

        it('lists every utm parameter, and only those', () => {
            const [issue] = getInternalLinkShapeIssues('/charts/?a=1&utm_source=x&utm_medium=y&b=2');
            expect(issue).toEqual({
                type: 'utm-parameters',
                href: '/charts/?a=1&utm_source=x&utm_medium=y&b=2',
                parameters: ['utm_source', 'utm_medium'],
            });
        });

        it('reports alongside the other shape issues', () => {
            expect(types('/charts?utm_source=x')).toEqual(['missing-trailing-slash', 'utm-parameters']);
        });

        it.each([
            '/charts/?promo=banner-studio-launch-week',
            '/charts/?theme=utm_quartz',
            // A `?` after the fragment marker belongs to the fragment, not a query
            '/charts/#section?utm_source=x',
            // A parameter that merely contains utm_ is not a UTM parameter
            '/charts/?not_utm_source=x',
            // Another site's link is not ours to police
            'https://github.com/ag-grid/ag-grid/?utm_source=x',
            'https://blog.ag-grid.com/post/?utm_source=x',
        ])('%s is left alone', (href) => {
            expect(types(href)).toEqual([]);
        });
    });

    describe('double slash', () => {
        it.each(['/studio//', '/charts//react/', 'https://www.ag-grid.com/react-data-grid//getting-started/'])(
            '%s',
            (href) => {
                expect(types(href)).toEqual(['double-slash']);
            }
        );
    });
});

describe('getCanonicalHostPath', () => {
    it.each([
        ['https://www.ag-grid.com/charts/', '/charts/'],
        ['http://www.ag-grid.com/charts/', '/charts/'],
        ['//www.ag-grid.com/charts/', '/charts/'],
        ['https://WWW.ag-grid.com/charts/?a=1#b', '/charts/?a=1#b'],
        ['https://www.ag-grid.com', '/'],
        ['https://www.ag-grid.com#top', '/#top'],
        ['https://www.ag-grid.com?a=1', '/?a=1'],
    ])('%s is served at %s', (href, path) => {
        expect(getCanonicalHostPath(href)).toBe(path);
    });

    it.each([
        '/charts/',
        '#section',
        'https://ag-grid.com/charts/',
        'https://blog.ag-grid.com/post/',
        'https://github.com/ag-grid/ag-grid',
        'https://www.ag-grid.com.evil.example/charts/',
    ])('%s is not on the canonical host', (href) => {
        expect(getCanonicalHostPath(href)).toBeUndefined();
    });
});

describe('isInternalHref', () => {
    it.each([
        '/charts/',
        '/react-data-grid/getting-started/#quick-start',
        '#section',
        '#',
        'https://www.ag-grid.com/charts/',
        '//www.ag-grid.com/charts/',
        'https://ag-grid.com/charts/',
    ])('%s is internal', (href) => {
        expect(isInternalHref(href)).toBe(true);
    });

    it.each(['', 'mailto:info@ag-grid.com', 'https://github.com/ag-grid/ag-grid', 'relative/path', './relative'])(
        '%s is not',
        (href) => {
            expect(isInternalHref(href)).toBe(false);
        }
    );
});

describe('describeInternalLinkShapeIssue', () => {
    it('names the redirect target for a missing slash', () => {
        const [issue] = getInternalLinkShapeIssues('/charts?utm_source=x');
        expect(describeInternalLinkShapeIssue(issue)).toBe(
            'Link /charts?utm_source=x is missing its trailing slash and will redirect to /charts/; add the slash.'
        );
    });

    it('names the canonical host for a redirecting host', () => {
        const [issue] = getInternalLinkShapeIssues('https://ag-grid.com/charts/');
        expect(describeInternalLinkShapeIssue(issue)).toBe(
            'Link https://ag-grid.com/charts/ points at ag-grid.com, which redirects to www.ag-grid.com; link to the canonical host directly.'
        );
    });

    it('names the parameters of a UTM-tagged link', () => {
        const [issue] = getInternalLinkShapeIssues('/charts/?utm_source=x&utm_medium=y');
        expect(describeInternalLinkShapeIssue(issue)).toBe(
            "Link /charts/?utm_source=x&utm_medium=y carries utm_source, utm_medium; UTM parameters on an internal link overwrite the visitor's original traffic source in analytics, so remove them."
        );
    });
});
