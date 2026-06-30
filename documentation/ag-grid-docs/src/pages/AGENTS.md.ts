import { parseVersion } from '@ag-website-shared/utils/parseVersion';
import { siteRootUrl } from '@ag-website-shared/utils/structuredData';
import { getFrameworkPath } from '@components/docs/utils/urlPaths';
import { agGridVersion } from '@constants';
import { buildAgentsMd } from '@utils/agentReadinessFiles';
import { type CollectionEntry, getEntry } from 'astro:content';

// Served at /AGENTS.md. Generated on every build from the canonical base URL and
// the current major version, so it cannot drift from the shipped product (SE-77).
export async function GET() {
    const { data: metadata } = (await getEntry('metadata', 'metadata')) as CollectionEntry<'metadata'>;

    const output = buildAgentsMd({
        siteRoot: siteRootUrl(metadata.canonicalUrlBase),
        majorVersion: parseVersion(agGridVersion).major,
        gridDocsPrefix: getFrameworkPath('javascript'),
    });

    return new Response(output, {
        status: 200,
        headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
        },
    });
}
