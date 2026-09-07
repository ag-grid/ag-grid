import { markdownTable } from '@ag-website-shared/markdoc/markdownTable';
import { getDocumentationArchiveUrl } from '@ag-website-shared/utils/getArchiveUrl';
import { getChangelogUrl } from '@ag-website-shared/utils/getChangelogUrl';
import { parseVersion } from '@ag-website-shared/utils/parseVersion';

import versionsData from '../../content/versions/ag-grid-versions.json';
import { buildGridFrontmatter } from './gridFrontmatter';

const TABLE_HEADERS = ['Version', 'Date', 'Type', 'Documentation', 'Changelog'];

interface VersionEntry {
    version: string;
    date?: string;
    noDocs?: boolean;
}

// The archive page (documentation-archive.astro + MajorTable.astro) lists one section per
// major, and within it every non-`noDocs` release, linking each to its archived docs and
// changelog. Both link helpers already return absolute www.ag-grid.com URLs.
function majorTable(versions: VersionEntry[]): string {
    const rows = versions.map((entry) => {
        const docsUrl = getDocumentationArchiveUrl({ site: 'grid', version: entry.version });
        const changelogUrl = getChangelogUrl({ site: 'grid', version: entry.version });
        return [
            entry.version,
            entry.date ?? '',
            parseVersion(entry.version).versionType,
            `[${entry.version} Documentation](${docsUrl})`,
            `[Changelog](${changelogUrl})`,
        ];
    });
    return markdownTable(TABLE_HEADERS, rows);
}

/**
 * Build the markdown twin of the /documentation-archive/ page: archived documentation and
 * changelog links for every past AG Grid release, grouped by major version (newest first).
 * Reads the same `versions` collection JSON the page renders, so the two cannot drift.
 */
export function buildDocumentationArchiveMarkdown({ siteRoot }: { siteRoot?: string } = {}): string {
    const versions = versionsData as VersionEntry[];

    // Majors newest-first, mirroring documentation-archive.astro (the JSON is already sorted
    // newest-first and majors appear as `x.0.0` entries).
    const majors = versions
        .filter((entry) => parseVersion(entry.version).isMajor)
        .map((entry) => parseVersion(entry.version).major);

    const frontmatter = buildGridFrontmatter({
        pageUrl: '/documentation-archive/',
        siteRoot,
        title: 'AG Grid Documentation Archive',
        description:
            'Browse archived documentation for previous AG Grid versions, from version 14 and onwards. View changelogs for every minor and major release.',
    });

    const sections = [frontmatter, '# Documentation Archive', 'Review documentation for previous AG Grid versions.'];

    for (const major of majors) {
        const majorVersions = versions.filter((entry) => parseVersion(entry.version).major === major && !entry.noDocs);
        sections.push(`## Version ${major}`);
        sections.push(majorTable(majorVersions));
    }

    return `${sections.filter(Boolean).join('\n\n').trimEnd()}\n`;
}
