import type { BryntumCampaignContent } from '@components/campaigns-components/bryntum/types';
import { describe, expect, it } from 'vitest';

import calendar from '../../content/campaigns/bryntum-products/calendar.json';
import complete from '../../content/campaigns/bryntum-products/complete.json';
import gantt from '../../content/campaigns/bryntum-products/gantt.json';
import scheduler from '../../content/campaigns/bryntum-products/scheduler.json';
import taskboard from '../../content/campaigns/bryntum-products/taskboard.json';
import tiers from '../../content/campaigns/bryntum-tiers.json';
import { resolveBryntumTierTokens } from '../bryntumTierTokens';
import { buildCampaignMarkdown, campaignMeta } from './buildCampaignMarkdown';

const resolve = (raw: unknown) => resolveBryntumTierTokens(raw as BryntumCampaignContent, tiers);

const CAMPAIGNS: Record<string, BryntumCampaignContent> = {
    calendar: resolve(calendar),
    complete: resolve(complete),
    gantt: resolve(gantt),
    scheduler: resolve(scheduler),
    taskboard: resolve(taskboard),
};

const build = (content: BryntumCampaignContent) => buildCampaignMarkdown({ content });

describe('buildCampaignMarkdown', () => {
    describe.each(Object.entries(CAMPAIGNS))('%s', (_slug, content) => {
        const output = build(content);

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

        it('leaves no unresolved template tokens', () => {
            expect(output).not.toContain('{{');
        });

        it('ends with a single trailing newline', () => {
            expect(output.endsWith('\n')).toBe(true);
            expect(output.endsWith('\n\n')).toBe(false);
        });
    });

    it('resolves campaign links to bryntum.com, since the copy is written for that site', () => {
        const output = build(CAMPAIGNS.gantt);
        expect(output).toContain('https://bryntum.com/products/gantt/examples');
    });

    it('converts body_html lists and emphasis rather than flattening them', () => {
        const output = build(CAMPAIGNS.gantt);
        expect(output).toMatch(/^- /m);
        expect(output).toContain('**');
    });

    it('lists each tier with its licence and features, saying what it builds on', () => {
        const output = build(CAMPAIGNS.gantt);
        expect(output).toContain('**Community** (Free, MIT licence).\n- Task grid and timeline');
        expect(output).toContain(`**${tiers.core}** (Commercial licence). Everything in Community, plus:\n- `);
        expect(output).toContain(`**Enterprise** (Commercial licence). Everything in ${tiers.core}, plus:\n- `);
    });

    it('keeps the hero copy under the H1', () => {
        const output = build(CAMPAIGNS.gantt);
        expect(output).toContain('# The Quickest JS Gantt Chart');
        expect(output).toContain('Bryntum Gantt is a speed-tuned');
    });
});
