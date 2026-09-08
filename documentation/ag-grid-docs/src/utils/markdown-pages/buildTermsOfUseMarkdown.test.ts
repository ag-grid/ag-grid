import { describe, expect, it } from 'vitest';

import { buildTermsOfUseMarkdown } from './buildTermsOfUseMarkdown';
import { TERMS_OF_USE_CONTENT } from './termsOfUseContent';

const SITE_ROOT = 'https://www.ag-grid.com/';

describe('buildTermsOfUseMarkdown', () => {
    it('emits frontmatter, then exactly one H1 matching the page heading', async () => {
        const output = await buildTermsOfUseMarkdown({ siteRoot: SITE_ROOT });
        expect(output.startsWith('---\n')).toBe(true);
        expect(output).toContain(`title: ${JSON.stringify(`AG Grid: ${TERMS_OF_USE_CONTENT.metaTitle}`)}`);
        expect(output.match(/^# /gm)?.length).toBe(1);
        expect(output).toContain('# AG Grid Terms of Use');
        expect(output).not.toContain('\ntitle: ""');
    });

    it('renders the preamble and the numbered body from the .mdoc', async () => {
        const output = await buildTermsOfUseMarkdown({ siteRoot: SITE_ROOT });
        expect(output).toContain('Last Updated: 8 September 2026');
        expect(output).toContain('Welcome to the Terms of Use for our website.');
        expect(output).toContain('Acceptance of Terms');
        expect(output).toContain('Limitation of Liability');
        expect(output).toContain('[**Privacy Policy**](');
        expect(output.endsWith('\n')).toBe(true);
        expect(output.endsWith('\n\n')).toBe(false);
    });
});
