import { describe, expect, it } from 'vitest';

import { COMMUNITY_LICENCE, COMMUNITY_LICENCE_CONTENT, parseLicenceText } from './communityLicenceContent';

describe('parseLicenceText', () => {
    it('splits the name, copyright and paragraphs, re-joining hard-wrapped lines', () => {
        const parsed = parseLicenceText(
            [
                'The MIT License',
                '',
                'Copyright (c) 2015 Example',
                '',
                'Permission is hereby',
                'granted.',
                '',
                'AS IS.',
                '',
            ].join('\n')
        );

        expect(parsed).toEqual({
            name: 'The MIT License',
            copyright: 'Copyright (c) 2015 Example',
            terms: ['Permission is hereby granted.', 'AS IS.'],
        });
    });

    it('rejects a file that is not shaped like a licence', () => {
        expect(() => parseLicenceText('The MIT License\n\nCopyright only')).toThrow();
    });
});

describe('COMMUNITY_LICENCE', () => {
    it('is the MIT licence shipped in the ag-grid-community package', () => {
        expect(COMMUNITY_LICENCE.name).toBe('The MIT License');
        expect(COMMUNITY_LICENCE.copyright).toMatch(/^Copyright \(c\) 2015-\d{4} AG GRID LTD$/);
        expect(COMMUNITY_LICENCE.terms).toHaveLength(3);
        expect(COMMUNITY_LICENCE.terms[0]).toMatch(/^Permission is hereby granted, free of charge/);
        expect(COMMUNITY_LICENCE.terms[2]).toMatch(/^THE SOFTWARE IS PROVIDED "AS IS"/);
        // Hard wrapping is removed, so no term carries a line break.
        expect(COMMUNITY_LICENCE.terms.some((term) => term.includes('\n'))).toBe(false);
    });

    it('feeds the page preamble', () => {
        expect(COMMUNITY_LICENCE_CONTENT.meta).toEqual([COMMUNITY_LICENCE.name, COMMUNITY_LICENCE.copyright]);
    });
});
