import type { BryntumCampaignContent } from '@components/campaigns-components/bryntum/types';
import { DISABLE_MARKDOWN_DOCS } from '@constants';
import { buildCampaignMarkdown } from '@utils/markdown-pages/buildCampaignMarkdown';

// Served at /campaigns/bryntum-<product>.md — the markdown twin of each partner campaign page,
// built from the same campaign JSON the page renders. Mirrors the page's own getStaticPaths
// (including its slug aliases) so the two URL sets line up 1:1. Content-negotiates from the HTML
// URL on Accept: text/markdown (see the SE-80 rules in htaccessRules.ts).
export async function getStaticPaths() {
    if (DISABLE_MARKDOWN_DOCS) {
        return [];
    }
    // Match the rewritten `{slug}.json` content files; the original `{slug}-original.json` files
    // are kept for reference but no longer rendered.
    const contentModules = import.meta.glob<BryntumCampaignContent>(
        [
            '../../content/campaigns/bryntum-products/*.json',
            '!../../content/campaigns/bryntum-products/*-original.json',
        ],
        { eager: true, import: 'default' }
    );

    const slugAliases: Record<string, string> = {
        schedulerpro: 'scheduler-pro',
        taskboard: 'task-board',
    };

    return Object.values(contentModules).map((content) => ({
        params: { bryntumProduct: `bryntum-${slugAliases[content.slug] ?? content.slug}` },
        props: { content },
    }));
}

export function GET({ props }: { props: { content: BryntumCampaignContent } }) {
    return new Response(buildCampaignMarkdown({ content: props.content }), {
        status: 200,
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
}
