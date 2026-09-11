import { describe, expect, it } from 'vitest';

import { buildEulaMarkdown } from './buildEulaMarkdown';
import { EULA_CONTENT } from './eulaContent';

const SITE_ROOT = 'https://www.ag-grid.com/';

describe('buildEulaMarkdown', () => {
    it('emits frontmatter, then exactly one H1 matching the page heading', async () => {
        const output = await buildEulaMarkdown({ siteRoot: SITE_ROOT });
        expect(output.startsWith('---\n')).toBe(true);
        expect(output).toContain(`title: ${JSON.stringify(`AG Grid: ${EULA_CONTENT.metaTitle}`)}`);
        expect(output.match(/^# /gm)?.length).toBe(1);
        expect(output).toContain('# AG Grid End User Licence Agreement');
        expect(output).not.toContain('\ntitle: ""');
    });

    it('renders the preamble, the numbered clauses and the schedules from the .mdoc', async () => {
        const output = await buildEulaMarkdown({ siteRoot: SITE_ROOT });
        expect(output).toContain('Last Updated: 9 September 2026');
        expect(output).toContain(
            '**PLEASE READ THESE LICENCE TERMS (v40) CAREFULLY BEFORE DOWNLOADING ANY SOFTWARE:**'
        );
        expect(output).toContain('Definitions and interpretation');
        expect(output).toContain('16.14 These Terms are governed by English law.');
        expect(output).toContain('Schedule 1: Support Services');
        expect(output).toContain('Schedule 2: Exhibit B');
        expect(output.endsWith('\n')).toBe(true);
        expect(output.endsWith('\n\n')).toBe(false);
    });
});
