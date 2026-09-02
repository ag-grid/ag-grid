import { describe, expect, it } from 'vitest';

import { describeInternalLinkShapeIssue, getInternalLinkShapeIssues } from './internalLinkShape';

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
            expect(types('/charts/gallery?utm_source=x')).toEqual(['missing-trailing-slash']);
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
    });

    describe('insecure scheme', () => {
        it('flags http:// on the canonical host', () => {
            expect(types('http://www.ag-grid.com/charts/')).toEqual(['insecure-scheme']);
        });

        it('flags scheme and host together on a bare apex', () => {
            expect(types('http://ag-grid.com/charts/')).toEqual(['insecure-scheme', 'redirecting-host']);
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
});
