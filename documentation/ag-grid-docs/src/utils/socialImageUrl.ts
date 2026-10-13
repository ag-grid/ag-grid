import { siteRootUrl } from '@ag-website-shared/utils/structuredData';
import { SITE_BASE_URL } from '@constants';

import { urlWithBaseUrl } from './urlWithBaseUrl';

/**
 * The `og:image` / `twitter:image` URL for a page. Open Graph and Twitter crawlers require absolute
 * image URLs, so a site path is resolved against the site root; an absolute URL is kept as is.
 */
export function getSocialImageUrl({
    canonicalUrlBase,
    image,
    siteBaseUrl = SITE_BASE_URL,
}: {
    canonicalUrlBase: string;
    image: string;
    siteBaseUrl?: string;
}): string {
    const pathOrUrl = urlWithBaseUrl(image, siteBaseUrl);
    return pathOrUrl.startsWith('http') ? pathOrUrl : `${siteRootUrl(canonicalUrlBase)}${pathOrUrl.replace(/^\//, '')}`;
}
