import type { PolicyName } from '@ag-website-shared/components/policies/policyContent';
import { POLICY_CONTENT } from '@ag-website-shared/components/policies/policyContent';
import cookiesBody from '@ag-website-shared/content/policies/cookies.mdoc?raw';
import modernSlaveryBody from '@ag-website-shared/content/policies/modern-slavery.mdoc?raw';
import privacyBody from '@ag-website-shared/content/policies/privacy.mdoc?raw';
import { buildPolicyMarkdown } from '@ag-website-shared/markdown-pages/policies/buildPolicyMarkdown';
import { describe, expect, it } from 'vitest';

import markdocConfig from '../../../markdoc.config';

const SITE_ROOT = 'https://www.ag-grid.com/';

// Only the policies that ship a twin. /privacy/your-choice has none: it is the opt-out
// confirmation page, disallowed in robots.txt and excluded from the sitemap.
const BODIES = {
    privacy: privacyBody,
    cookies: cookiesBody,
    'modern-slavery': modernSlaveryBody,
} as const satisfies Partial<Record<PolicyName, string>>;

type TwinnedPolicy = keyof typeof BODIES;

const build = (policy: TwinnedPolicy) =>
    buildPolicyMarkdown({ policy, name: 'AG Grid', body: BODIES[policy], markdocConfig, siteRoot: SITE_ROOT });

describe('buildPolicyMarkdown', () => {
    describe.each(Object.keys(BODIES) as TwinnedPolicy[])('%s', (policy) => {
        it('emits frontmatter, then exactly one H1 matching the page heading', async () => {
            const output = await build(policy);
            expect(output.startsWith('---\n')).toBe(true);
            expect(output).toContain(`title: ${JSON.stringify(`AG Grid: ${POLICY_CONTENT[policy].metaTitle}`)}`);
            // The renderer emits its own frontmatter for the body; it must be stripped so the
            // page's own heading is the only H1 and there is a single frontmatter block.
            // (`---` also appears mid-document as a thematic break, so match the block itself.)
            expect(output.match(/^# /gm)?.length).toBe(1);
            expect(output.match(/^---\n(?:.*\n)*?---\n/)).not.toBeNull();
            expect(output).not.toContain('\ntitle: ""');
        });

        it('renders the shared meta and intro copy as markdown, not raw HTML', async () => {
            const output = await build(policy);
            expect(output).not.toContain('<strong>');
            expect(output).not.toContain('<a href');
            expect(output.endsWith('\n')).toBe(true);
            expect(output.endsWith('\n\n')).toBe(false);
        });
    });

    it('renders the numbered policy body from the .mdoc, including its section headings', async () => {
        const output = await build('privacy');
        expect(output).toContain('# AG Grid Privacy Policy');
        expect(output).toContain('Effective Date: 6 July 2022');
        expect(output).toContain('**Your privacy is important to us.**');
        expect(output).toContain('Introduction');
        expect(output).toContain('Marketing Communications');
    });

    it('renders the cookie inventory the page shows below the policy body (AG-18105)', async () => {
        const output = await build('cookies');
        expect(output).toContain('## Cookies We Use');
        expect(output).toContain('The cookies listed below were last reviewed on 7 August 2026.');
        // One table per category, from the same JSON the CookiesTable component reads.
        expect(output).toContain('### Strictly Necessary Cookies');
        expect(output).toContain('| Cookie Subgroup | Cookies | Cookies used |');
        expect(output).toContain('agGridFramework');
    });

    it('carries the modern slavery statement’s financial year and version block', async () => {
        const output = await build('modern-slavery');
        expect(output).toContain('**For the Financial Year Ending 31 December 2026**');
        expect(output).toContain('**Effective Date:** 01 January 2026');
        expect(output).toContain('Organisation Structure and Supply Chain');
    });
});
