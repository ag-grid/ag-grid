import type { MarkdownResolvers } from '@ag-website-shared/markdoc/renderMarkdocToMarkdown';
import { buildPolicyPageMarkdown } from '@ag-website-shared/markdown-pages/policies/buildPolicyMarkdown';

import markdocConfig from '../../../markdoc.config';
// Raw Markdoc source for the body. The page imports the same file as a compiled Astro component;
// `?raw` gives the twin the source to re-render as markdown.
import termsOfUseBody from '../../content/policies/terms-of-use.mdoc?raw';
import { GRID_PRODUCT_NAME, gridSiteFrontmatter } from './gridFrontmatter';
import { TERMS_OF_USE_CONTENT } from './termsOfUseContent';

const PAGE_NAME = 'terms-of-use';

/** The `/terms-of-use.md` twin, from the same preamble and `.mdoc` body the page renders. */
export function buildTermsOfUseMarkdown({
    siteRoot,
    resolvers,
}: {
    siteRoot?: string;
    resolvers?: MarkdownResolvers;
}): Promise<string> {
    return buildPolicyPageMarkdown({
        content: TERMS_OF_USE_CONTENT,
        name: GRID_PRODUCT_NAME,
        pageName: PAGE_NAME,
        body: termsOfUseBody,
        markdocConfig,
        resolvers,
        siteRoot,
        siteFrontmatter: gridSiteFrontmatter({ pageUrl: `/${PAGE_NAME}/`, siteRoot }),
    });
}
