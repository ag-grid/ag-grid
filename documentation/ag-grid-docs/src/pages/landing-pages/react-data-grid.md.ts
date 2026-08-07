import { landingPageMarkdownResponse } from '@utils/markdown-pages/landingPageMarkdownResponse';

// Served at /landing-pages/react-data-grid.md — the markdown twin of the page, built from the
// same landing-pages/react-data-grid.json the page renders. Content-negotiates from the HTML
// URL on Accept: text/markdown (see the SE-80 rules in htaccessRules.ts).
export const GET = () => landingPageMarkdownResponse('react-data-grid');
