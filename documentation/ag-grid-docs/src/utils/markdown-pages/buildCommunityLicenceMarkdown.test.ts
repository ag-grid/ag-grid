import { describe, expect, it } from 'vitest';

import { buildCommunityLicenceMarkdown } from './buildCommunityLicenceMarkdown';
import { COMMUNITY_LICENCE_CONTENT } from './communityLicenceContent';

const SITE_ROOT = 'https://www.ag-grid.com/';

describe('buildCommunityLicenceMarkdown', () => {
    it('emits frontmatter, then exactly one H1 matching the page heading', () => {
        const output = buildCommunityLicenceMarkdown({ siteRoot: SITE_ROOT });
        expect(output.startsWith('---\n')).toBe(true);
        expect(output).toContain(`title: ${JSON.stringify(`AG Grid: ${COMMUNITY_LICENCE_CONTENT.metaTitle}`)}`);
        expect(output.match(/^# /gm)?.length).toBe(1);
        expect(output).toContain('# AG Grid Community Licence');
    });

    it('relates the page to the other legal pages in its footer group', () => {
        const output = buildCommunityLicenceMarkdown({ siteRoot: SITE_ROOT });
        expect(output).toContain('url: "https://www.ag-grid.com/eula/enterprise/"');
        expect(output).toContain('url: "https://www.ag-grid.com/terms-of-use/"');
    });

    it('renders the preamble and the licence terms from the package LICENSE.txt', () => {
        const output = buildCommunityLicenceMarkdown({ siteRoot: SITE_ROOT });
        expect(output).toContain('\nThe MIT License\n');
        expect(output).toMatch(/\nCopyright \(c\) 2015-\d{4} AG GRID LTD\n/);
        expect(output).toContain('AG Grid Community is free and open source under the MIT licence');
        expect(output).toContain(
            'Permission is hereby granted, free of charge, to any person obtaining a copy of this software'
        );
        expect(output).toContain('THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND');
        expect(output.endsWith('\n')).toBe(true);
        expect(output.endsWith('\n\n')).toBe(false);
    });
});
