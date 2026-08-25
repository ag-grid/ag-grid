import { describe, expect, it } from 'vitest';

import { type DemoDefinition, demoContent, demoContentInternals, demoNames } from './demoContent';
import { demoTabs } from './demosData';

const { deriveTitle, deriveHeading, deriveDescription, deriveIntro, MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH } =
    demoContentInternals;

/** A demo supplying only the descriptive half of the contract, so every `seo*` field is derived. */
const UNDESCRIBED_DEMO: DemoDefinition = {
    useCase: 'Logistics',
    pageType: 'Dashboard',
    framework: 'React',
    features: ['Route planning', 'Live vehicle tracking', 'Delivery status filters'],
    hook: 'Live Fleet Data',
    href: '/example-logistics/',
    githubUrl: 'https://github.com/ag-grid/ag-grid-demos/tree/main/logistics',
    activeTab: 'inventory',
};

describe('demo frontmatter contract', () => {
    describe.each(demoNames)('%s', (demo) => {
        const content = demoContent(demo);

        it('serves a real title rather than a "Demo - {name}" fallback', () => {
            expect(content.seoTitle.startsWith('Demo - ')).toBe(false);
            expect(content.seoTitle).toContain('AG Grid');
        });

        it('has an H1 and an indexable intro', () => {
            expect(content.seoH1.length).toBeGreaterThan(0);
            expect(content.seoH1.startsWith('Demo - ')).toBe(false);
            // An intro short enough to be a bare label is not the 1 to 2 sentences SE-125 asks for.
            expect(content.intro.length).toBeGreaterThan(80);
        });

        it('names at least one feature shown', () => {
            expect(content.features.length).toBeGreaterThan(0);
        });

        it('has a root-relative href matching its demo tab', () => {
            const tab = demoTabs.find(({ key }) => key === content.activeTab);
            expect(tab?.href).toBe(content.href);
        });
    });
});

describe('derived seo fields', () => {
    it('derives the title, H1, description and intro when the contract omits them', () => {
        expect(deriveHeading(UNDESCRIBED_DEMO)).toBe('Logistics Dashboard Example');
        expect(deriveTitle(UNDESCRIBED_DEMO)).toBe('Logistics Dashboard Example - Live Fleet Data | AG Grid');
        expect(deriveDescription(UNDESCRIBED_DEMO)).toContain('route planning');
        expect(deriveIntro(UNDESCRIBED_DEMO)).toContain('The demo runs in React');
    });

    it('drops the hook rather than serving a title Google would truncate', () => {
        const longHook: DemoDefinition = { ...UNDESCRIBED_DEMO, hook: 'Live Fleet Tracking Across Every Depot' };
        expect(deriveTitle(longHook)).toBe('Logistics Dashboard Example | AG Grid');
        expect(deriveTitle(longHook).length).toBeLessThanOrEqual(MAX_TITLE_LENGTH);
    });

    it('keeps a derived description inside the meta-description window', () => {
        expect(deriveDescription(UNDESCRIBED_DEMO).length).toBeLessThanOrEqual(MAX_DESCRIPTION_LENGTH);
    });

    it('offers the source in the frameworks the live demo does not use', () => {
        const intro = deriveIntro(UNDESCRIBED_DEMO);
        expect(intro).toContain('available in JavaScript, Angular and Vue');
    });

    it('defaults the framework to JavaScript', () => {
        expect(deriveIntro({ ...UNDESCRIBED_DEMO, framework: undefined })).toContain('The demo runs in JavaScript');
    });
});
