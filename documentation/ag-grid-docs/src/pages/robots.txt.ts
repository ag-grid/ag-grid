import { SITE_URL } from '@constants';
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

    const ignorePaths = await getSitemapIgnorePaths();
    const output = disallowAll ? disallowAllRobotsTxt() : productionRobotsTxt(ignorePaths);

    return new Response(output, {
        status: 200,
        headers: {
            'Content-Type': 'text/plain',
        },
    });
}
