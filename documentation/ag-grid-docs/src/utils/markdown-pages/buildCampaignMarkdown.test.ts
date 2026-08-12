import type { BryntumCampaignContent } from '@components/campaigns-components/bryntum/types';
import { describe, expect, it } from 'vitest';

import calendar from '../../content/campaigns/bryntum-products/calendar.json';
import complete from '../../content/campaigns/bryntum-products/complete.json';
import gantt from '../../content/campaigns/bryntum-products/gantt.json';
import scheduler from '../../content/campaigns/bryntum-products/scheduler.json';
import schedulerpro from '../../content/campaigns/bryntum-products/schedulerpro.json';
import taskboard from '../../content/campaigns/bryntum-products/taskboard.json';
import { buildCampaignMarkdown, campaignMeta } from './buildCampaignMarkdown';

const CAMPAIGNS: Record<string, unknown> = { calendar, complete, gantt, scheduler, schedulerpro, taskboard };

const build = (content: unknown) => buildCampaignMarkdown({ content: content as BryntumCampaignContent });

describe('buildCampaignMarkdown', () => {
    describe.each(Object.entries(CAMPAIGNS))('%s', (_slug, raw) => {
        const content = raw as BryntumCampaignContent;
        const output = build(raw);

        it('opens with frontmatter from the same meta the page uses, then the hero as H1', () => {
            const { title, description } = campaignMeta(content);
            expect(output.startsWith('---\n')).toBe(true);
            expect(output).toContain(`title: ${JSON.stringify(title)}`);
            expect(output).toContain(`description: ${JSON.stringify(description)}`);
            expect(output.match(/^# /gm)?.length).toBe(1);
        });

        it('renders a heading for every section that has one, in page order', () => {
            const headings = content.sections
                .slice(1)
                .map((section) => section.heading)
                .filter((heading): heading is string => Boolean(heading));
            let cursor = 0;
            for (const heading of headings) {
                const index = output.indexOf(`## ${heading}`, cursor);
                expect(index, `section "${heading}" missing or out of order`).toBeGreaterThan(-1);
                cursor = index;
            }
        });

        it('leaves no raw HTML behind and resolves every link to an absolute URL', () => {
            expect(output).not.toMatch(/<\/?(?:p|a|ul|li|span|strong|code|h[1-6])\b/);
            const relative = [...output.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)]
                .map((match) => match[1])
                .filter((href) => !href.startsWith('http') && !href.startsWith('mailto:') && href !== '#');
            expect(relative).toEqual([]);
        });

        it('ends with a single trailing newline', () => {
            expect(output.endsWith('\n')).toBe(true);
            expect(output.endsWith('\n\n')).toBe(false);
        });
    });

    it('resolves campaign links to bryntum.com, since the copy is written for that site', () => {
        const output = build(gantt);
        expect(output).toContain('https://bryntum.com/products/gantt/examples');
    });

    it('converts body_html lists and emphasis rather than flattening them', () => {
        const output = build(gantt);
        expect(output).toMatch(/^- /m);
        expect(output).toContain('**');
    });

    it('keeps the hero copy under the H1', () => {
        const output = build(gantt);
        expect(output).toContain('# The Quickest JS Gantt Chart');
        expect(output).toContain('Bryntum Gantt is a speed-tuned');
    });
});
