import type { PolicyContent } from '@ag-website-shared/components/policies/policyContent';

// The licence text shipped in the ag-grid-community package is the golden source: the page and
// its `/eula/community.md` twin both render it, so the website cannot drift from the package.
import licenceText from '../../../../../packages/ag-grid-community/LICENSE.txt?raw';

export interface LicenceText {
    /** The licence's name, e.g. `The MIT License`. */
    name: string;
    /** The copyright line, e.g. `Copyright (c) 2015-2026 AG GRID LTD`. */
    copyright: string;
    /** The licence terms, one entry per paragraph, with the hard wrapping of the text file removed. */
    terms: string[];
}

/**
 * Split a plain-text licence file into its name, copyright line and paragraphs of terms. The
 * file is hard-wrapped for reading in a terminal, so each paragraph's lines are re-joined.
 */
export function parseLicenceText(text: string): LicenceText {
    const [name, copyright, ...terms] = text
        .trim()
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.replace(/\s*\n\s*/g, ' ').trim());

    if (!name || !copyright || terms.length === 0) {
        throw new Error('Expected a licence name, a copyright line and at least one paragraph of terms.');
    }

    return { name, copyright, terms };
}

export const COMMUNITY_LICENCE = parseLicenceText(licenceText);

/**
 * Prose for the AG Grid Community licence page that lives outside the licence text — the heading,
 * the licence name and copyright lines and the introductory sentence. Shared with the
 * `/eula/community.md` twin so the two cannot drift. The terms themselves are `COMMUNITY_LICENCE`.
 *
 * Grid-only, like the End User Licence Agreement: the licence is published from ag-grid.com.
 */
export const COMMUNITY_LICENCE_CONTENT: PolicyContent = {
    heading: 'AG Grid Community Licence',
    metaTitle: 'Community Licence',
    description:
        'The MIT licence under which AG Grid Community is free to use, as shipped in the ag-grid-community package.',
    meta: [COMMUNITY_LICENCE.name, COMMUNITY_LICENCE.copyright],
    intro: [
        'AG Grid Community is free and open source under the MIT licence, reproduced below. AG Grid Enterprise is licensed separately under the AG Grid End User Licence Agreement.',
    ],
};
