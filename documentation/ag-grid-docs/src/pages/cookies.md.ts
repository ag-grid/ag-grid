import { policyMarkdownResponse } from '@utils/markdown-pages/policyMarkdownResponse';

// Served at /cookies.md — the markdown twin of the page, rendered from the same shared
// preamble and the same policies/cookies.mdoc body the page renders. Content-negotiates
// from the HTML URL on Accept: text/markdown (see the SE-80 rules in htaccessRules.ts).
export const GET = () => policyMarkdownResponse('cookies');
