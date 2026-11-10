import type { BryntumCampaignContent } from '@components/campaigns-components/bryntum/types';
import { describe, expect, it } from 'vitest';

import tiers from '../content/campaigns/bryntum-tiers.json';
import { loadBryntumCampaigns } from './bryntumCampaigns';

/** Fields a visitor or search index reads as copy; URLs, filenames and ids are exempt. */
const VISIBLE_TEXT_FIELDS = new Set([
    'alt',
    'body_html',
    'body_text',
    'description',
    'eyebrow',
    'heading',
    'logo_alt',
    'og_description',
    'og_title',
    'text',
    'title',
]);

/** Pages that link to their own tier comparison table on bryntum.com. */
const COMPARISON_PRODUCTS = ['calendar', 'gantt', 'scheduler', 'taskboard'];

/** Bryntum is renaming its middle tier from Business to Core; copy must use only whichever one `bryntum-tiers.json` names. */
const OTHER_MIDDLE_TIER_NAME = new RegExp(
    `\\b(${['Business', 'Core'].filter((name) => name !== tiers.core).join('|')})\\b`
);

const campaigns = loadBryntumCampaigns();

function collectStrings(value: unknown, key = '', out: { key: string; value: string }[] = []) {
    if (typeof value === 'string') {
        out.push({ key, value });
    } else if (Array.isArray(value)) {
        value.forEach((item) => collectStrings(item, key, out));
    } else if (value && typeof value === 'object') {
        Object.entries(value).forEach(([childKey, child]) => collectStrings(child, childKey, out));
    }
    return out;
}

function visibleText(content: BryntumCampaignContent): string[] {
    return collectStrings(content)
        .filter(({ key }) => VISIBLE_TEXT_FIELDS.has(key))
        .map(({ key, value }) => (key === 'body_html' ? value.replace(/<[^>]*>/g, ' ') : value));
}

function ctaHrefs(content: BryntumCampaignContent): string[] {
    return content.sections
        .flatMap((section) => ('ctas' in section && section.ctas ? section.ctas : []))
        .map(({ href }) => href);
}

describe('Bryntum campaign content', () => {
    it('covers every product page', () => {
        expect(campaigns.map(({ content }) => content.slug).sort()).toEqual([
            'calendar',
            'complete',
            'gantt',
            'scheduler',
            'taskboard',
        ]);
    });

    it('lists Scheduler as one product on the Complete page', () => {
        const complete = campaigns.find(({ content }) => content.slug === 'complete')?.content;
        const schedulerBlocks = complete?.sections.filter(
            (section) => 'eyebrow' in section && /scheduler/i.test(String(section.eyebrow))
        );
        expect(schedulerBlocks).toHaveLength(1);
    });

    describe.each(campaigns.map(({ content }) => [content.slug, content] as const))('%s', (slug, content) => {
        it('leaves no unresolved template tokens', () => {
            expect(collectStrings(content).filter(({ value }) => value.includes('{{'))).toEqual([]);
        });

        it('uses no middle-tier name other than the configured one', () => {
            expect(visibleText(content).filter((text) => OTHER_MIDDLE_TIER_NAME.test(text))).toEqual([]);
        });

        it('does not present Scheduler Pro as a product', () => {
            expect(visibleText(content).filter((text) => /scheduler[\s-]?pro\b/i.test(text))).toEqual([]);
        });

        it('links to the tier details on bryntum.com', () => {
            const expected = COMPARISON_PRODUCTS.includes(slug)
                ? `/products/${slug}/features#${slug}-comparison-heading`
                : '/tiers-faq/';
            expect(ctaHrefs(content)).toContain(expected);
        });

        it('names all three tiers in both the rendered and the indexed copy', () => {
            const tierSection = content.sections.find((section) => 'eyebrow' in section && section.eyebrow === 'Tiers');
            expect(tierSection).toBeDefined();
            for (const field of ['body_html', 'body_text'] as const) {
                const copy =
                    tierSection && field in tierSection ? String(tierSection[field as keyof typeof tierSection]) : '';
                for (const tier of ['Community', tiers.core, 'Enterprise']) {
                    expect(copy).toContain(tier);
                }
            }
        });
    });
});
