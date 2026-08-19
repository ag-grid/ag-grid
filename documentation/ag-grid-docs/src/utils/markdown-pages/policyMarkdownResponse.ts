import type { PolicyName } from '@ag-website-shared/components/policies/policyContent';
// Raw Markdoc source for the policy bodies. The pages import the same files as compiled Astro
// components; `?raw` gives the twins the source to re-render as markdown.
import modernSlaveryBody from '@ag-website-shared/content/policies/modern-slavery.mdoc?raw';
import privacyBody from '@ag-website-shared/content/policies/privacy.mdoc?raw';
import type { MdocPolicyName } from '@ag-website-shared/markdown-pages/policies/buildPolicyMarkdown';
import {
    buildCookiesMarkdown,
    buildPolicyMarkdown,
} from '@ag-website-shared/markdown-pages/policies/buildPolicyMarkdown';
import { DISABLE_MARKDOWN_DOCS, SITE_URL } from '@constants';
import { createGridMarkdownResolvers } from '@utils/markdoc/renderMarkdocResolvers';

import markdocConfig from '../../../markdoc.config';

/** The raw `.mdoc` body each policy renders from. Cookies has none — see `buildCookiesMarkdown`. */
const POLICY_BODIES: Record<MdocPolicyName, string> = {
    privacy: privacyBody,
    'modern-slavery': modernSlaveryBody,
};

/**
 * Shared body of the policy `.md` endpoints. Each renders the same shared preamble and the same
 * `.mdoc` body its page renders, so only the policy name differs between endpoints. Cookies is the
 * exception: its page renders the Enzuzo embed, so the twin is a stub pointing at it (AG-18194).
 */
export async function policyMarkdownResponse(policy: PolicyName): Promise<Response> {
    if (DISABLE_MARKDOWN_DOCS) {
        return new Response(null, { status: 404 });
    }

    const markdown =
        policy === 'cookies'
            ? buildCookiesMarkdown({ name: 'AG Grid', siteRoot: SITE_URL })
            : await buildPolicyMarkdown({
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
