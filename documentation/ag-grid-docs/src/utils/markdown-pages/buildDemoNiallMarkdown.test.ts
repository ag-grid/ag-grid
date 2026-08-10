import { describe, expect, it } from 'vitest';

import niallData from '../../content/about/niall.json';
import demosData from '../../content/demos/demos.json';
import { type DemoName, buildDemoMarkdown, demoContent } from './buildDemoMarkdown';
import { buildNiallMarkdown } from './buildNiallMarkdown';

const SITE_ROOT = 'https://www.ag-grid.com/';

describe('buildDemoMarkdown', () => {
    describe.each(Object.keys(demosData) as DemoName[])('%s', (demo) => {
        const output = buildDemoMarkdown({ demo, siteRoot: SITE_ROOT });
        const content = demoContent(demo);

        it('emits frontmatter and copy from the same content the page renders', () => {
            expect(output).toContain(`title: ${JSON.stringify(content.metaTitle)}`);
            expect(output).toContain(`description: ${JSON.stringify(content.metaDescription)}`);
            expect(output).toContain(`# ${content.heading}`);
            expect(output).toContain(content.bodyText);
        });

        it('points at the demo source and the live page', () => {
            expect(output).toContain(`[See on GitHub](${content.githubUrl})`);
            expect(output).toContain(`https://www.ag-grid.com/example-${demo}/`);
            expect(output).toContain('https://www.ag-grid.com/contact/');
        });

        it('ends with a single trailing newline', () => {
            expect(output.endsWith('\n')).toBe(true);
            expect(output.endsWith('\n\n')).toBe(false);
        });
    });
});

describe('buildNiallMarkdown', () => {
    const output = buildNiallMarkdown({ siteRoot: SITE_ROOT });

    it('emits frontmatter and the page heading with its eyebrow', () => {
        expect(output).toContain(`title: ${JSON.stringify(niallData.meta.title)}`);
        expect(output).toContain(`# ${niallData.heading}`);
        expect(output).toContain(`*${niallData.eyebrow}*`);
    });

    it('carries every paragraph of the tribute, in page order', () => {
        let cursor = output.indexOf(niallData.intro);
        expect(cursor).toBeGreaterThan(-1);
        for (const paragraph of niallData.sections.flat()) {
            const index = output.indexOf(paragraph, cursor);
            expect(index, `paragraph missing or out of order: ${paragraph.slice(0, 40)}…`).toBeGreaterThan(-1);
            cursor = index;
        }
    });

    it('renders the photographs with alt text, captions and absolute sources', () => {
        for (const photo of niallData.photos) {
            expect(output).toContain(`![${photo.alt}](https://www.ag-grid.com/${photo.src})`);
        }
        expect(output).toContain('*Niall Crosby 1977-2024*');
    });

    it('ends with a single trailing newline', () => {
        expect(output.endsWith('\n')).toBe(true);
        expect(output.endsWith('\n\n')).toBe(false);
    });
});
