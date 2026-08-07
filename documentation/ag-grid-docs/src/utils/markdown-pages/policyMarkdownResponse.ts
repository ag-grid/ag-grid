import type { PolicyName } from '@ag-website-shared/components/policies/policyContent';
// Raw Markdoc source for the policy bodies. The pages import the same files as compiled Astro
// components; `?raw` gives the twins the source to re-render as markdown.
import cookiesBody from '@ag-website-shared/content/policies/cookies.mdoc?raw';
import modernSlaveryBody from '@ag-website-shared/content/policies/modern-slavery.mdoc?raw';
import privacyBody from '@ag-website-shared/content/policies/privacy.mdoc?raw';
import { buildPolicyMarkdown } from '@ag-website-shared/markdown-pages/policies/buildPolicyMarkdown';
import { DISABLE_MARKDOWN_DOCS, SITE_URL } from '@constants';
import { createGridMarkdownResolvers } from '@utils/markdoc/renderMarkdocResolvers';

import markdocConfig from '../../../markdoc.config';

// `your-choice` is intro prose only — it has no numbered policy body.
const POLICY_BODIES: Record<PolicyName, string | undefined> = {
    privacy: privacyBody,
    cookies: cookiesBody,
    'modern-slavery': modernSlaveryBody,
    'your-choice': undefined,
};

/**
 * Shared body of the policy `.md` endpoints. Each renders the same shared preamble and the same
 * `.mdoc` body its page renders, so only the policy name differs between endpoints.
 */
export async function policyMarkdownResponse(policy: PolicyName): Promise<Response> {
    if (DISABLE_MARKDOWN_DOCS) {
        return new Response(null, { status: 404 });
    }

    const markdown = await buildPolicyMarkdown({
        policy,
        name: 'AG Grid',
        body: POLICY_BODIES[policy],
        markdocConfig,
        resolvers: createGridMarkdownResolvers({ siteRoot: SITE_URL }),
        siteRoot: SITE_URL,
    });

    return new Response(markdown, {
        status: 200,
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
}
