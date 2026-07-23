import { siteRootUrl } from '@ag-website-shared/utils/structuredData';
import { getFrameworkPath } from '@components/docs/utils/urlPaths';
import { buildMcpServerCard } from '@utils/mcpServerCard';
import { type CollectionEntry, getEntry } from 'astro:content';

// Served at /.well-known/mcp/server-card.json. A machine-readable discovery card
// so an agent that probes the well-known location finds the ag-mcp server without
// prior knowledge (SE-79). Generated from the canonical base URL so the docs link
// cannot drift from the shipped site.
export async function GET() {
    const { data: metadata } = (await getEntry('metadata', 'metadata')) as CollectionEntry<'metadata'>;

    const output = buildMcpServerCard({
        siteRoot: siteRootUrl(metadata.canonicalUrlBase),
        gridDocsPrefix: getFrameworkPath('javascript'),
    });

    return new Response(output, {
        status: 200,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
    });
}
