import { policyMarkdownResponse } from '@utils/markdown-pages/policyMarkdownResponse';

// Served at /modern-slavery.md — the markdown twin of the page, rendered from the same shared
// preamble and the same policies/modern-slavery.mdoc body the page renders. Content-negotiates
// from the HTML URL on Accept: text/markdown (see the SE-80 rules in htaccessRules.ts).
export const GET = () => policyMarkdownResponse('modern-slavery');
