import type { Framework } from '@ag-grid-types';
import { CHARTS_SITE_URL } from '@constants';
import { pathJoin } from '@utils/pathJoin';

export const chartsUrlWithPrefix = ({
    url = '',
    framework,
    siteBaseUrl = CHARTS_SITE_URL,
}: {
    url: string;
    framework?: Framework;
    siteBaseUrl?: string;
}): string => {
    let path = url;
    if (url.startsWith('./')) {
        path = pathJoin(siteBaseUrl, framework, url.slice('./'.length));
    } else if (url.startsWith('/')) {
        path = pathJoin(siteBaseUrl, url);
    }

    // Site pages are directory indexes, so the slash-less form only reaches them via a redirect, and
    // `pathJoin` drops any trailing slash the caller passed in. Anchored and query urls already
    // terminate the path, so they are left alone. Anything that was neither `./` nor `/` is a url we
    // did not build, and is returned as it came in.
    return path === url || path.includes('#') || path.includes('?') ? path : `${path}/`;
};
