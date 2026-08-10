import { policyMarkdownResponse } from '@utils/markdown-pages/policyMarkdownResponse';

// Served at /privacy.md — the markdown twin of the page, rendered from the same shared
// preamble and the same policies/privacy.mdoc body the page renders. Content-negotiates
// from the HTML URL on Accept: text/markdown (see the SE-80 rules in htaccessRules.ts).
export const GET = () => policyMarkdownResponse('privacy');
