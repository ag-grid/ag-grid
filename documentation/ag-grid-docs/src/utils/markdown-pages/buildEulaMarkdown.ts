import type { MarkdownResolvers } from '@ag-website-shared/markdoc/renderMarkdocToMarkdown';
import { buildPolicyPageMarkdown } from '@ag-website-shared/markdown-pages/policies/buildPolicyMarkdown';

import markdocConfig from '../../../markdoc.config';
// Raw Markdoc source for the body. The page imports the same file as a compiled Astro component;
// `?raw` gives the twin the source to re-render as markdown.
import eulaBody from '../../content/policies/eula.mdoc?raw';
import { EULA_CONTENT } from './eulaContent';
import { GRID_PRODUCT_NAME, gridSiteFrontmatter } from './gridFrontmatter';

const PAGE_NAME = 'eula';

/** The `/eula.md` twin, from the same preamble and `.mdoc` body the page renders. */
export function buildEulaMarkdown({
    siteRoot,
    resolvers,
}: {
    siteRoot?: string;
    resolvers?: MarkdownResolvers;
}): Promise<string> {
    return buildPolicyPageMarkdown({
        content: EULA_CONTENT,
        name: GRID_PRODUCT_NAME,
        pageName: PAGE_NAME,
        body: eulaBody,
        markdocConfig,
        resolvers,
        siteRoot,
        siteFrontmatter: gridSiteFrontmatter({ pageUrl: `/${PAGE_NAME}/`, siteRoot }),
    });
}
