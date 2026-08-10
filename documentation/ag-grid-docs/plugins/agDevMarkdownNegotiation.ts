import type { Plugin } from 'vite';

import agDevMarkdownNegotiation from '../../../external/ag-website-shared/plugins/agDevMarkdownNegotiation';
import { DISABLE_MARKDOWN_DOCS } from '../src/constants';
import { markdownPathPatterns } from '../src/utils/markdownPages';

// SE-80: content-negotiate grid pages to their markdown variant in the dev server.
// Grid supplies its URL shapes; the shared factory holds the mechanism
// (see external/ag-website-shared/plugins/agDevMarkdownNegotiation for the full rationale).
// The page list comes from GRID_MARKDOWN_PAGE_GROUPS, the same registry the production
// htaccess rules derive from, so dev and prod cannot disagree about what is negotiable.
// The homepage twin is handled by the factory: grid is a root site, so the default
// base (`/`) maps `/` to `/index.md`.
export default function agDevGridMarkdownNegotiation(): Plugin {
    return agDevMarkdownNegotiation({
        pathPatterns: markdownPathPatterns(),
        disabled: DISABLE_MARKDOWN_DOCS,
    });
}
