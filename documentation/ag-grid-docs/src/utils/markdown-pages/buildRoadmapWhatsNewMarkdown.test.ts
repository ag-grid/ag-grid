import { buildRoadmapMarkdown } from '@ag-website-shared/markdown-pages/buildRoadmapMarkdown';
import { buildWhatsNewMarkdown, whatsNewMeta } from '@ag-website-shared/markdown-pages/buildWhatsNewMarkdown';
import { urlWithPrefix } from '@utils/urlWithPrefix';
import { describe, expect, it } from 'vitest';

import roadmapData from '../../../public/roadmap/roadmap.json';
import versionsData from '../../content/versions/ag-grid-versions.json';

const SITE_ROOT = 'https://www.ag-grid.com/';
const resolveUrl = (url: string) => urlWithPrefix({ framework: 'javascript', url });

describe('buildRoadmapMarkdown', () => {
    const output = buildRoadmapMarkdown({
        roadmapData,
        productName: 'AG Grid',
        siteRoot: SITE_ROOT,
        resolveUrl,
        year: 2026,
    });

    it('emits frontmatter and the page H1, then the intro from roadmap.json', () => {
        expect(output.startsWith('---\n')).toBe(true);
        expect(output).toContain("# What we're building next");
        expect(output).toContain(`## ${roadmapData.introTitle}`);
        expect(output).toContain(roadmapData.introText);
    });

    it('formats the last-updated date the way the page does', () => {
        expect(output).toContain('Last updated: August 5, 2026');
    });

    it('groups every item under its quarter heading, carrying status, description and rationale', () => {
        for (const quarter of new Set(roadmapData.items.map((item) => item.q))) {
            expect(output).toContain(`## Q${quarter} 2026`);
        }
        for (const item of roadmapData.items) {
            expect(output, `missing item "${item.title}"`).toContain(item.title);
            expect(output).toContain(item.desc);
            expect(output).toContain(`**Why:** ${item.why}`);
        }
    });

    it('marks each item with its status, so an agent can tell shipped from planned', () => {
        expect(output).toContain('(shipped)');
        expect(output).toContain('(in progress)');
        expect(output).toContain('(planned)');
    });

    it('resolves item links into the framework docs', () => {
        const linked = roadmapData.items.find((item) => item.link);
        expect(linked).toBeDefined();
        expect(output).toContain(`(${SITE_ROOT.replace(/\/$/, '')}${resolveUrl(linked!.link!)})`);
    });
});

describe('buildWhatsNewMarkdown', () => {
    const output = buildWhatsNewMarkdown({ site: 'grid', versionsData, siteRoot: SITE_ROOT, resolveUrl });

    it('emits frontmatter matching the page meta, then the page H1', () => {
        const { title, description } = whatsNewMeta('grid');
        expect(output).toContain(`title: ${JSON.stringify(title)}`);
        expect(output).toContain(`description: ${JSON.stringify(description)}`);
        expect(output).toContain("# What's New in AG Grid");
    });

    it('lists at most the 12 versions with highlights that the page shows, newest first', () => {
        const expected = versionsData.filter((version) => version.highlights).slice(0, 12);
        const headings = [...output.matchAll(/^## (\S+)/gm)].map((match) => match[1]);
        expect(headings).toEqual(expected.map((version) => version.version));
        expect(headings.length).toBeLessThanOrEqual(12);
        expect(output).toContain(`## ${expected[0].version} (latest)`);
    });

    it('links highlights into the docs and derives the release blog URL as the page does', () => {
        expect(output).toContain('https://www.ag-grid.com/javascript-data-grid/column-headers/#editable-header-name');
        expect(output).toContain('https://www.ag-grid.com/blog/whats-new-in-ag-grid-36-1/');
    });

    it('labels the release-notes link by release kind, as the page does', () => {
        expect(output).toMatch(/\[See (release notes|migration guide)\]/);
    });

    it('ends with a single trailing newline', () => {
        expect(output.endsWith('\n')).toBe(true);
        expect(output.endsWith('\n\n')).toBe(false);
    });
});
