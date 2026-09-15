import { htmlInlineToMarkdown } from '@ag-website-shared/markdoc/htmlInlineToMarkdown';

import { COMMUNITY_LICENCE, COMMUNITY_LICENCE_CONTENT } from './communityLicenceContent';
import { GRID_PRODUCT_NAME, buildGridFrontmatter } from './gridFrontmatter';

const PAGE_URL = '/eula/community/';

/**
 * The `/eula/community.md` twin, from the same preamble and licence text the page renders. The
 * licence is plain text rather than a `.mdoc`, so unlike the other policy twins there is no
 * Markdoc body to re-render: its paragraphs are already markdown.
 */
export function buildCommunityLicenceMarkdown({ siteRoot }: { siteRoot?: string }): string {
    const { heading, metaTitle, description, meta, intro } = COMMUNITY_LICENCE_CONTENT;

    const document = [
        buildGridFrontmatter({
            pageUrl: PAGE_URL,
            siteRoot,
            title: `${GRID_PRODUCT_NAME}: ${metaTitle}`,
            description,
        }),
        `# ${heading}`,
        ...meta.map((line) => htmlInlineToMarkdown(line, siteRoot)),
        ...intro.map((line) => htmlInlineToMarkdown(line, siteRoot)),
        ...COMMUNITY_LICENCE.terms,
    ];

    return `${document.join('\n\n').trimEnd()}\n`;
}
