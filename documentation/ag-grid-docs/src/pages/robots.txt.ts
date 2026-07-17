import { CHARTS_ROBOTS_DISALLOW_JSON_URL, STUDIO_ROBOTS_DISALLOW_JSON_URL } from '@constants';
import { getIsDev, getIsProduction } from '@utils/env';
import { disallowAllRobotsTxt, fetchRobotsDisallow, productionRobotsTxt } from '@utils/robotsTxt';
import { getSitemapAllowPaths, getSitemapIgnorePaths } from '@utils/sitemapPages';

export async function GET() {
    // NOTE: /archive is ignored in `ignorePaths` on production
    const disallowAll = !getIsDev() && !getIsProduction();

    let output;
    if (disallowAll) {
        output = disallowAllRobotsTxt();
    } else {
        const gridIgnorePaths = await getSitemapIgnorePaths();
        const otherIgnorePaths = await fetchRobotsDisallow([
            CHARTS_ROBOTS_DISALLOW_JSON_URL,
            STUDIO_ROBOTS_DISALLOW_JSON_URL,
        ]);
        const ignorePaths = gridIgnorePaths.concat(otherIgnorePaths);
        const allowPaths = await getSitemapAllowPaths();
        output = productionRobotsTxt(allowPaths, ignorePaths);
    }

    return new Response(output, {
        status: 200,
        headers: {
            'Content-Type': 'text/plain',
        },
    });
}
