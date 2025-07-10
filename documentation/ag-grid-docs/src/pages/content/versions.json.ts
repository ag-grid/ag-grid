import { getContentApiArchiveUrl } from '@ag-website-shared/utils/content-api/urlPaths';
import { type CollectionEntry, getEntry } from 'astro:content';

function parseDateString(dateString: string): string {
    if (!dateString) {
        return '';
    }
    const cleanDateString = dateString.replace(/(\d+)(st|nd|rd|th)/, '$1');
    const date = new Date(cleanDateString);

    if (Number.isNaN(date as any)) {
        throw new Error('Invalid date format');
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export async function GET() {
    const { data } = (await getEntry('contentApi', 'content-api')) as CollectionEntry<'contentApi'>;
    const { data: versionsData } = (await getEntry('versions', 'ag-grid-versions')) as CollectionEntry<'versions'>;

    // Get first version with a date
    const lastVersionData = versionsData.find((version) => version.date)!;
    const lastVersion = {
        version: lastVersionData.version,
        releaseData: parseDateString(lastVersionData.date!),
        url: getContentApiArchiveUrl({ version: lastVersionData.version }),
        isLatest: true,
    };

    const previousVersionsData = data.previousVersions || [];
    const previousVersions = previousVersionsData
        .map(({ version }) => {
            const versionData = versionsData.find((v) => version === v.version);
            if (!versionData || !versionData.date || versionData.noDocs) {
                return;
            }

            return {
                version,
                releaseData: parseDateString(versionData.date),
                url: getContentApiArchiveUrl({ version }),
            };
        })
        .filter((v) => Boolean(v));

    const versions = [lastVersion, ...previousVersions];

    return new Response(JSON.stringify(versions), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
