import { policyMarkdownResponse } from '@utils/markdown-pages/policyMarkdownResponse';

// Served at /privacy/your-choice.md — the markdown twin of the opt-out confirmation page,
// built from the same shared copy the page renders. Content-negotiates from the HTML URL
// on Accept: text/markdown (see the SE-80 rules in htaccessRules.ts).
export const GET = () => policyMarkdownResponse('your-choice');
