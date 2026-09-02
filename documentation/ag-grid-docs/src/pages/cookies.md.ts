import { policyMarkdownResponse } from '@utils/markdown-pages/policyMarkdownResponse';

// Served at /cookies.md — the markdown twin of the page. The page renders the Enzuzo policy embed,
// which builds the policy in the browser, so unlike the other policy twins this one is a stub
// pointing at the page rather than a re-render of a `.mdoc` body (AG-18194). Content-negotiates
// from the HTML URL on Accept: text/markdown (see the SE-80 rules in htaccessRules.ts).
export const GET = () => policyMarkdownResponse('cookies');
