import type { Plugin } from 'vite';

import agDevMarkdownNegotiation from '../../../external/ag-website-shared/plugins/agDevMarkdownNegotiation';
import { DISABLE_MARKDOWN_DOCS, FRAMEWORKS } from '../src/constants';

// A single docs page path, e.g. `/react-data-grid/cell-editing/`. The final
// segment excludes dots so the `.md` variant itself never matches (no rewrite
// loop) and the framework landing page (`/react-data-grid/`, which has no `.md`)
// is left alone.
const DOCS_PAGE_PATH = new RegExp(`/(?:${FRAMEWORKS.join('|')})-data-grid/[^/.]+/?$`);

// Top-level (non-docs) pages that also ship a `.md` twin. Kept in sync with the same page
// list in the SE-80 htaccess negotiation rule (see htaccessRules.ts).
const TOP_LEVEL_MD_PATH = /^\/(?:license-pricing|changelog|pipeline|about|documentation-archive|example)\/?$/;

// The /community landing page and its subpages, each with a `.md` twin.
const COMMUNITY_MD_PATH = /^\/community(?:\/(?:events|showcase|tools-extensions|media|beyond-the-prompt))?\/?$/;

// SE-80: content-negotiate grid docs pages to their markdown variant in the dev
// server. Grid supplies its URL shapes; the shared factory holds the mechanism
// (see external/ag-website-shared/plugins/agDevMarkdownNegotiation for the full rationale).
// The homepage twin is handled by the factory: grid is a root site, so the default
// base (`/`) maps `/` to `/index.md`.
export default function agDevGridMarkdownNegotiation(): Plugin {
    return agDevMarkdownNegotiation({
        pathPatterns: [DOCS_PAGE_PATH, TOP_LEVEL_MD_PATH, COMMUNITY_MD_PATH],
        disabled: DISABLE_MARKDOWN_DOCS,
    });
}
