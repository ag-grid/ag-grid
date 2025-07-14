import { getContentApiArchiveUrl, getContentApiPrefix } from '@ag-website-shared/utils/content-api/urlPaths';
import { parseVersion } from '@ag-website-shared/utils/parseVersion';
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
    const supportedVersionFrom = parseVersion(data.supportedVersionFrom);
    const { data: versionsData } = (await getEntry('versions', 'ag-grid-versions')) as CollectionEntry<'versions'>;

    const lastVersionData = versionsData.find((version) => version.date)!;
    const versions = versionsData
        .filter(({ version }) => {
            const parsedVersion = parseVersion(version);

            if (parsedVersion.major < supportedVersionFrom.major) {
                return false;
            } else if (
                parsedVersion.major === supportedVersionFrom.major &&
                parsedVersion.minor < supportedVersionFrom.minor
            ) {
                return false;
            } else if (
                parsedVersion.major === supportedVersionFrom.major &&
                parsedVersion.minor === supportedVersionFrom.minor &&
                parsedVersion.patch < supportedVersionFrom.patch
            ) {
                return false;
            }

            return true;
        })
        .map((data) => {
            const latestData: any = { ...data };
            if (latestData.version === lastVersionData.version) {
                latestData.isLatest = true;
            }

            return latestData;
        })
        .map(({ version, isLatest }) => {
            const versionData = versionsData.find((v) => version === v.version);
            if (!versionData || !versionData.date || versionData.noDocs) {
                return;
            }

            return {
                version,
                releaseDate: parseDateString(versionData.date),
                url: isLatest ? getContentApiPrefix('index.json') : getContentApiArchiveUrl({ version }),
                isLatest,
            };
        })
        .filter((v) => Boolean(v));

    return new Response(JSON.stringify(versions), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
