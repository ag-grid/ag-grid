import { getGitDate, getGitHash, getGitShortHash } from '@ag-website-shared/utils/gitUtils';
import { SITE_BASE_URL, SITE_URL, agChartsVersion, agGridVersion } from '@constants';
import { getIsArchive, getIsDev, getIsProduction, getIsStaging } from '@utils/env';

export async function GET() {
    const buildDate = new Date();
    const hash = getGitHash();
    const shortHash = getGitShortHash();
    const gitDate = getGitDate();

    const body = {
        buildDate,
        git: {
            hash,
            shortHash,
            date: gitDate,
        },
        versions: {
            grid: agGridVersion,
            charts: agChartsVersion,
        },
        site: {
            baseUrl: SITE_BASE_URL,
            siteUrl: SITE_URL,
        },
        env: {
            isDev: getIsDev(),
            isStaging: getIsStaging(),
            isProduction: getIsProduction(),
            isArchive: getIsArchive(),
        },
    };

    return new Response(JSON.stringify(body), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
