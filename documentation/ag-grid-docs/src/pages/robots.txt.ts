import { CHARTS_ROBOTS_DISALLOW_JSON_URL, SITE_URL } from '@constants';
import { getIsDev, getIsProduction } from '@utils/env';
import { pathJoin } from '@utils/pathJoin';
import { getSitemapIgnorePaths } from '@utils/sitemapPages';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';

const disallowAllRobotsTxt = () => 'User-agent: * Disallow: /';

const productionRobotsTxt = (disallowPaths: string[] = []) => `User-agent: *
${disallowPaths
    .map((path) => {
        return `Disallow: ${path}`;
    })
    .join('\n')}

Sitemap: ${pathJoin(SITE_URL, urlWithBaseUrl('/sitemap-index.xml'))}
`;

export async function GET() {
    // NOTE: /archive is ignored in `ignorePaths` on production
    const disallowAll = !getIsDev() && !getIsProduction();

    const gridIgnorePaths = await getSitemapIgnorePaths();

    const chartsIgnorePaths = await fetch(CHARTS_ROBOTS_DISALLOW_JSON_URL).then((resp) => resp.json());
    const ignorePaths = gridIgnorePaths.concat(chartsIgnorePaths);

    const output = disallowAll ? disallowAllRobotsTxt() : productionRobotsTxt(ignorePaths);

    return new Response(output, {
        status: 200,
        headers: {
            'Content-Type': 'text/plain',
        },
    });
}
