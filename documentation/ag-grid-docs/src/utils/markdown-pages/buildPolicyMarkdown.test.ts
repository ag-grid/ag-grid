import { POLICY_CONTENT } from '@ag-website-shared/components/policies/policyContent';
import modernSlaveryBody from '@ag-website-shared/content/policies/modern-slavery.mdoc?raw';
import privacyBody from '@ag-website-shared/content/policies/privacy.mdoc?raw';
import type { MdocPolicyName } from '@ag-website-shared/markdown-pages/policies/buildPolicyMarkdown';
import {
    buildCookiesMarkdown,
    buildPolicyMarkdown,
} from '@ag-website-shared/markdown-pages/policies/buildPolicyMarkdown';
import { describe, expect, it } from 'vitest';

import markdocConfig from '../../../markdoc.config';

const SITE_ROOT = 'https://www.ag-grid.com/';

// Cookies is absent: its page renders the Enzuzo embed rather than a `.mdoc`, so its twin comes
// from `buildCookiesMarkdown` instead (AG-18194) and is covered separately below.
const BODIES: Record<MdocPolicyName, string> = {
    privacy: privacyBody,
    'modern-slavery': modernSlaveryBody,
};

const build = (policy: MdocPolicyName) =>
    buildPolicyMarkdown({ policy, name: 'AG Grid', body: BODIES[policy], markdocConfig, siteRoot: SITE_ROOT });

describe('buildPolicyMarkdown', () => {
    describe.each(Object.keys(BODIES) as MdocPolicyName[])('%s', (policy) => {
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
        expect(output).toContain('Last Updated: 2 September 2026');
        expect(output).toContain('**Your privacy is important to us.**');
        expect(output).toContain('Introduction');
        expect(output).toContain('Marketing Communications');
        expect(output).toContain('Purposes Of Processing And Lawful Bases');
    });

    it('carries the modern slavery statement’s financial year and version block', async () => {
        const output = await build('modern-slavery');
        expect(output).toContain('**For the Financial Year Ending 31 December 2026**');
        expect(output).toContain('**Effective Date:** 01 January 2026');
        expect(output).toContain('Organisation Structure and Supply Chain');
    });
});

describe('buildCookiesMarkdown', () => {
    const output = buildCookiesMarkdown({ name: 'AG Grid', siteRoot: SITE_ROOT });

    it('emits the same frontmatter shape as the other policy twins', () => {
        expect(output.startsWith('---\n')).toBe(true);
        expect(output).toContain(`title: ${JSON.stringify(`AG Grid: ${POLICY_CONTENT.cookies.metaTitle}`)}`);
        expect(output).toContain(`description: ${JSON.stringify(POLICY_CONTENT.cookies.description)}`);
        expect(output.endsWith('\n')).toBe(true);
        expect(output.endsWith('\n\n')).toBe(false);
    });

    it('is a single-heading stub pointing at the page the embed renders on', () => {
        expect(output.match(/^# /gm)?.length).toBe(1);
        expect(output).toContain('# AG Grid Cookies Policy');
        expect(output).toContain('(https://www.ag-grid.com/cookies/)');
        // The inventory the page used to render by hand is Enzuzo's job now, not the twin's.
        expect(output).not.toContain('## Cookies We Use');
    });
});
