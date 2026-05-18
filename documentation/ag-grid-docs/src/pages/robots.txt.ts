import { CHARTS_ROBOTS_DISALLOW_JSON_URL, SITE_URL, STUDIO_ROBOTS_DISALLOW_JSON_URL } from '@constants';
import { getIsDev, getIsProduction } from '@utils/env';
import { pathJoin } from '@utils/pathJoin';
import { getSitemapAllowPaths, getSitemapIgnorePaths } from '@utils/sitemapPages';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';

const disallowAllRobotsTxt = () => 'User-agent: *\nDisallow: /';

const productionRobotsTxt = (allowPaths: string[] = [], disallowPaths: string[] = []) => `User-agent: *
Allow: ${urlWithBaseUrl('/')}
Allow: ${urlWithBaseUrl('/charts/')}
Allow: ${urlWithBaseUrl('/studio/')}
${allowPaths
    .map((path) => {
        return `Allow: ${path}`;
    })
    .join('\n')}
${disallowPaths
    .map((path) => {
        return `Disallow: ${path}`;
    })
    .join('\n')}

Sitemap: ${pathJoin(SITE_URL, urlWithBaseUrl('/sitemap-index.xml'))}
`;

const fetchRobotsDisallow = async (urls: string[]) => {
    const fetches = urls.map((url) =>
        fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
                }
                return response.json();
            })
            .catch((error) => {
                // eslint-disable-next-line no-console
                console.error(`Error fetching ${url}:`, error);
                throw error;
            })
    );

    const results = await Promise.all(fetches);

    return results.flat();
};

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
