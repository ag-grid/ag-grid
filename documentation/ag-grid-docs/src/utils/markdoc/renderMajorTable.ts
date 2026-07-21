import type { Framework, Library } from '@ag-grid-types';
import { markdownTable } from '@ag-website-shared/markdoc/markdownTable';
import type { MarkdownFramework } from '@ag-website-shared/markdoc/renderMarkdocToMarkdown';
import { toAbsoluteUrl } from '@ag-website-shared/markdoc/toAbsoluteUrl';
import { getDocumentationArchiveUrl } from '@ag-website-shared/utils/getArchiveUrl';
import { getChangelogUrl } from '@ag-website-shared/utils/getChangelogUrl';
import { parseVersion } from '@ag-website-shared/utils/parseVersion';
import { urlWithPrefix } from '@utils/urlWithPrefix';

export interface VersionEntry {
    version: string;
    date?: string;
    notesPath?: string;
    noDocs?: boolean;
}

interface MajorTableAttributes {
    library?: Library;
    major?: number | string;
    type?: string;
    suppressChangelog?: boolean;
}

/**
 * Build a `majorTable` tag as a GFM table of the versions in a major release —
 * either the migration guides/release notes (`type: 'migration'`) or the archived
 * documentation + changelog links (`type: 'archive'`). Pure (no `astro:content`) so
 * it is unit-testable; mirrors MajorTable.astro's filters and link rules.
 */
export function buildMajorTable(
    versions: VersionEntry[],
    attributes: MajorTableAttributes,
    framework: MarkdownFramework,
    siteRoot?: string
): string {
    const library = (attributes.library ?? 'grid') as Library;
    const major = Number(attributes.major);
    const type = attributes.type === 'archive' ? 'archive' : 'migration';
    const suppressChangelog = Boolean(attributes.suppressChangelog);

    if (Number.isNaN(major)) {
        return '';
    }

    if (type === 'migration') {
        const rows = versions
            .filter((v) => parseVersion(v.version).major === major && v.notesPath)
            .map((version) => {
                const { versionType, isMajor } = parseVersion(version.version);
                // Majors whose notes are an upgrade guide link to the migration guide; versions
                // whose notes point at the changelog link to release notes.
                const isMigrationGuide = isMajor && !version.notesPath?.includes('/changelog');
                const href = toAbsoluteUrl(
                    urlWithPrefix({ url: version.notesPath!, framework: framework as Framework }),
                    siteRoot
                );
                const label = isMigrationGuide ? 'Migration Guide' : 'Release Notes';
                return [version.version, version.date ?? '', versionType, `[${label}](${href})`];
            });
        return markdownTable(['Version', 'Date', 'Type', 'Guide'], rows);
    }

    const headers = suppressChangelog
        ? ['Version', 'Date', 'Type', 'Documentation']
        : ['Version', 'Date', 'Type', 'Changelog', 'Documentation'];
    const rows = versions
        .filter((v) => parseVersion(v.version).major === major && !v.noDocs)
        .map((version) => {
            const { versionType } = parseVersion(version.version);
            const docsUrl = getDocumentationArchiveUrl({ site: library, version: version.version });
            const docsCell = `[${version.version} Documentation](${docsUrl})`;
            if (suppressChangelog) {
                return [version.version, version.date ?? '', versionType, docsCell];
            }
            const changelogUrl = getChangelogUrl({ site: library, version: version.version });
            return [version.version, version.date ?? '', versionType, `[Changelog](${changelogUrl})`, docsCell];
        });
    return markdownTable(headers, rows);
}
