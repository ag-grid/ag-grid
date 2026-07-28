import type { Library } from '@ag-grid-types';
import { markdownTable } from '@ag-website-shared/markdoc/markdownTable';
import { getDocumentationArchiveUrl } from '@ag-website-shared/utils/getArchiveUrl';
import { getChangelogUrl } from '@ag-website-shared/utils/getChangelogUrl';
import { parseVersion } from '@ag-website-shared/utils/parseVersion';

export interface MajorTableVersionEntry {
    version: string;
    date?: string;
    notesPath?: string;
    noDocs?: boolean;
}

export interface MajorTableAttributes {
    library?: Library;
    major?: number | string;
    type?: string;
    suppressChangelog?: boolean;
}

export interface BuildMajorTableParams {
    versions: MajorTableVersionEntry[];
    attributes: MajorTableAttributes;
    /** Library to fall back to when the tag omits `library` - the host product. */
    defaultLibrary: Library;
    /**
     * Turn a `notesPath` into the URL the markdown should link to. Injected because framework
     * prefixing and absolute-URL rules live in the host product, not here.
     */
    resolveNotesUrl: (notesPath: string) => string;
}

/**
 * Build a `majorTable` tag as a GFM table of the versions in a major release - either the
 * migration guides/release notes (`type: 'migration'`) or the archived documentation +
 * changelog links (`type: 'archive'`). Mirrors MajorTable.astro's filters and link rules.
 *
 * Pure: version data and URL resolution are passed in, so it is unit-testable and shared by
 * AG Grid, AG Charts and AG Studio.
 */
export function buildMajorTable({
    versions,
    attributes,
    defaultLibrary,
    resolveNotesUrl,
}: BuildMajorTableParams): string {
    const library = attributes.library ?? defaultLibrary;
    const major = Number(attributes.major);
    const type = attributes.type === 'archive' ? 'archive' : 'migration';
    const suppressChangelog = Boolean(attributes.suppressChangelog);

    if (Number.isNaN(major)) {
        return '';
    }

    if (type === 'migration') {
        const rows = versions
            .filter((entry) => parseVersion(entry.version).major === major && entry.notesPath)
            .map((entry) => {
                const { versionType, isMajor } = parseVersion(entry.version);
                // Majors whose notes are an upgrade guide link to the migration guide; versions
                // whose notes point at the changelog link to release notes.
                const isMigrationGuide = isMajor && !entry.notesPath!.includes('/changelog');
                const label = isMigrationGuide ? 'Migration Guide' : 'Release Notes';
                return [
                    entry.version,
                    entry.date ?? '',
                    versionType,
                    `[${label}](${resolveNotesUrl(entry.notesPath!)})`,
                ];
            });
        return markdownTable(['Version', 'Date', 'Type', 'Guide'], rows);
    }

    const headers = suppressChangelog
        ? ['Version', 'Date', 'Type', 'Documentation']
        : ['Version', 'Date', 'Type', 'Changelog', 'Documentation'];
    const rows = versions
        .filter((entry) => parseVersion(entry.version).major === major && !entry.noDocs)
        .map((entry) => {
            const { versionType } = parseVersion(entry.version);
            const docsUrl = getDocumentationArchiveUrl({ site: library, version: entry.version });
            const docsCell = `[${entry.version} Documentation](${docsUrl})`;
            if (suppressChangelog) {
                return [entry.version, entry.date ?? '', versionType, docsCell];
            }
            const changelogUrl = getChangelogUrl({ site: library, version: entry.version });
            return [entry.version, entry.date ?? '', versionType, `[Changelog](${changelogUrl})`, docsCell];
        });
    return markdownTable(headers, rows);
}
