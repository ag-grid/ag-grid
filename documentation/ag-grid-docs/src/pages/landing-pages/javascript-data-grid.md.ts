import { landingPageMarkdownResponse } from '@utils/markdown-pages/landingPageMarkdownResponse';

// Served at /landing-pages/javascript-data-grid.md — the markdown twin of the page, built from the
// same landing-pages/javascript-data-grid.json the page renders. Content-negotiates from the HTML
// URL on Accept: text/markdown (see the SE-80 rules in htaccessRules.ts).
export const GET = () => landingPageMarkdownResponse('javascript-data-grid');
