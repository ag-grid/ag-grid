import type { BryntumCampaignContent } from '@components/campaigns-components/bryntum/types';
import { DISABLE_MARKDOWN_DOCS, SITE_URL } from '@constants';
import { loadBryntumCampaigns } from '@utils/bryntumCampaigns';
import { buildCampaignMarkdown } from '@utils/markdown-pages/buildCampaignMarkdown';

// Served at /campaigns/bryntum-<product>.md — the markdown twin of each partner campaign page.
// Content-negotiates from the HTML URL on Accept: text/markdown (see the SE-80 rules in htaccessRules.ts).
export function getStaticPaths() {
    if (DISABLE_MARKDOWN_DOCS) {
        return [];
    }

    return loadBryntumCampaigns().map(({ urlSlug, content }) => ({
        params: { bryntumProduct: urlSlug },
        props: { content },
    }));
}

export function GET({ props }: { props: { content: BryntumCampaignContent } }) {
    return new Response(buildCampaignMarkdown({ content: props.content, siteRoot: SITE_URL }), {
        status: 200,
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
}
